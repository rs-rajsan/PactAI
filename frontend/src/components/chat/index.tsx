import { ChatInput } from "./input";
import { ChatOutput } from "./output";
import { ChatProvider } from "./provider";

export function Chat() {
    return (
        <div className="flex flex-col h-full gap-2">
            <ChatProvider>
                <div className="p-2 border-b">
                    <h2 className="text-lg font-semibold">Contract Chat</h2>
                    <p className="text-sm text-gray-600">Ask questions about your contracts</p>
                </div>
                <ChatOutput />
                <ChatInput />
            </ChatProvider>
        </div>
    );
}