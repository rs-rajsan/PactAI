import { ChatInput } from "./input";
import { ChatOutput } from "./output";
import { ChatProvider } from "./provider";
import { DocumentUpload } from "../upload/DocumentUpload";
import { useState } from "react";

export function Chat() {
    const [showUpload, setShowUpload] = useState(false);
    const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");

    const handleUploadComplete = (result: any) => {
        console.log('Upload completed:', result);
        // You can add logic here to refresh the chat or show a message
        setShowUpload(false);
    };

    return (
        <div className="flex flex-col h-full gap-2">
            <ChatProvider>
                {/* Upload Toggle Button */}
                <div className="flex justify-between items-center p-2 border-b">
                    <h2 className="text-lg font-semibold">Contract Intelligence</h2>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {showUpload ? 'Hide Upload' : 'Upload PDF'}
                    </button>
                </div>

                {/* Upload Component */}
                {showUpload && (
                    <div className="p-4 border-b bg-gray-50">
                        <DocumentUpload 
                            onUploadComplete={handleUploadComplete}
                            modelSelection={selectedModel}
                        />
                    </div>
                )}

                <ChatOutput />
                <ChatInput />
            </ChatProvider>
        </div>
    );
}
