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
                
                {/* CUAD Dataset Note */}
                <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
                    <p className="text-xs text-slate-500 text-center">
                        <strong>CUAD Dataset:</strong> Contract Understanding Atticus Dataset - 500+ legal contracts with 41 annotated clause types for comprehensive contract analysis.
                    </p>
                </div>
            </ChatProvider>
        </div>
    );
}