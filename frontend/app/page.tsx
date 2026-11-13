
"use client";

import { useRef, useState, useEffect } from "react";
import { FileText, Trash2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export default function Home() {
  // Chat states
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"general" | "documents">("documents");
  const [messages, setMessages] = useState<Message[]>([]);

  // Document upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:8000/documents");

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        setDocuments(data.documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  const [selectedDocument, setSelectedDocument] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState(false);

  // Ask AI a question
  async function handleAsk(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((previous) => [
      ...previous,
      { role: "user", content: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          source: selectedDocument === "all" ? null : selectedDocument,
          mode: chatMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to get an answer."
        );
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Upload a document
  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [".pdf", ".txt"];
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedTypes.includes(extension)) {
      setUploadError(true);
      setUploadMessage("Only PDF and TXT files are supported.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setUploadError(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document upload failed.");
      }

      setDocuments((previous) =>
        previous.includes(data.filename)
          ? previous
          : [...previous, data.filename]
      );

      setSelectedDocument(data.filename);

      setUploadMessage(
        `${data.filename} uploaded successfully! ${data.chunks_processed} chunks processed.`
      );
    } catch (error) {
      setUploadError(true);

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong during upload."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Delete a document
  const handleDeleteDocument = async (filename: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${filename}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8000/documents/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete document");
      }

      setDocuments((previous) =>
        previous.filter((document) => document !== filename)
      );

      if (selectedDocument === filename) {
        setSelectedDocument("all");
      }

      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">

      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 md:flex">

        {/* Branding */}
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            I
          </div>

          <div>
            <h1 className="text-lg font-bold">IntelliDoc AI</h1>
            <p className="text-xs text-slate-500">
              Intelligent documents
            </p>
          </div>
        </div>

        {/* Workspace */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <button className="mb-2 flex items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3 text-left text-sm font-semibold text-indigo-700">
          <span>✦</span>
          AI Assistant
        </button>

        {/* Chat mode */}
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setChatMode("general")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              chatMode === "general"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            General Chat
          </button>

          <button
            onClick={() => setChatMode("documents")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              chatMode === "documents"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Document Chat
          </button>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <span>＋</span>
          {uploading ? "Uploading..." : "Upload Documents"}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={handleUpload}
        />

        {/* Document selection */}
        <div className="mt-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Search in
          </label>

          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value="all">All documents</option>

            {documents.map((document) => (
              <option key={document} value={document}>
                {document}
              </option>
            ))}
          </select>
        </div>

        {/* Uploaded documents */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Uploaded Files
            </p>

            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600">
              {documents.length}
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs leading-5 text-slate-400">
              No documents uploaded yet. Upload a PDF or TXT file to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((document) => (
                <div
                  key={document}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100"
                >
                  <button
                    onClick={() => setSelectedDocument(document)}
                    title={document}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs text-slate-600"
                  >
                    <FileText
                      size={16}
                      className="shrink-0 text-indigo-600"
                    />
                    <span className="truncate">{document}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(document)}
                    title="Delete document"
                    className="shrink-0 rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI engine status */}
        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold">
              AI Engine
            </span>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Local AI engine powered by Ollama
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-h-screen flex-1 flex-col">

        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-10">
          <div>
            <h2 className="font-semibold">AI Assistant</h2>
            <p className="text-xs text-slate-500">
              Ask questions about your documents
            </p>
          </div>

          <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            ● System ready
          </div>
        </header>

        {/* Upload feedback */}
        {uploadMessage && (
          <div className="mx-auto mt-4 w-full max-w-4xl px-5 md:px-10">
            <div
              className={`rounded-lg border p-3 text-sm ${
                uploadError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {uploadMessage}
            </div>
          </div>
        )}

        {/* Chat section */}
        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-8 md:px-10">

          {/* Welcome screen */}
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl text-white shadow-lg shadow-indigo-200">
                ✦
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Your documents, understood.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Ask questions in natural language and get intelligent,
                context-aware answers from your documents.
              </p>

              {/* Suggested questions */}
              <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                {[
                  "How many sick leaves are allowed?",
                  "What are the working hours?",
                  "Who approves work from home?",
                  "What is the maternity leave policy?",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuestion(item)}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <span className="mb-2 block text-indigo-600">
                      ✦
                    </span>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation */
            <div className="flex-1 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      ✦
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-7 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Source references */}
                    {message.role === "assistant" &&
                      message.sources &&
                      message.sources.length > 0 && (
                        <div className="mt-4 border-t border-slate-200 pt-3">
                          <p className="mb-2 text-xs font-semibold text-slate-500">
                            Sources
                          </p>

                          {message.sources.map((source, i) => (
                            <p
                              key={i}
                              className="text-xs text-indigo-600"
                            >
                              ▤ {source}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    ✦
                  </div>

                  Thinkinggg...
                </div>
              )}
            </div>
          )}

          {/* Question input */}
          <form
            onSubmit={handleAsk}
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask anything about your documents..."
              rows={2}
              className="w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="px-2 text-xs text-slate-400">
                Powered by RAG + Ollama
              </span>

              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Thinking..." : "Ask AI →"}
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-xs text-slate-400">
            AI-generated responses may contain errors. Verify important information.
          </p>
        </section>
      </main>
    </div>
  );
}
