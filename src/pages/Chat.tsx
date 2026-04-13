import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages, useSendChatMessage } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";

export default function Chat() {
  const { data: messages = [], isLoading } = useChatMessages();
  const sendMessage = useSendChatMessage();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage.mutateAsync(text.trim());
    setText("");
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Team Chat</h1>
          <p className="text-muted-foreground text-sm">Discuss suspicious activities with your team</p>
        </div>

        <div className="flex-1 bg-card rounded-lg border flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && <p className="text-center text-muted-foreground">Loading messages...</p>}
            {!isLoading && messages.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No messages yet. Start a conversation!</p>
            )}
            {messages.map((msg) => {
              const isOwn = msg.user_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {!isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.user_name}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "opacity-70" : "text-muted-foreground"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sendMessage.isPending || !text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
