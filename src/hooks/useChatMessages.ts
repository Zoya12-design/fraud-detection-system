import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  message: string;
  created_at: string;
}

export function useChatMessages() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("chat_messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          qc.invalidateQueries({ queryKey: ["chat_messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["chat_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!user,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (message: string) => {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: user!.id,
        user_email: user!.email || "",
        user_name: user!.email?.split("@")[0] || "User",
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat_messages"] }),
  });
}
