import { useState, useEffect, useRef } from "react";
import { generateFile, downloadFileChunk, type FileInfo } from "../api";
import {
  Download,
  FileBox,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from "lucide-react";

export function DownloadPage() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [fileName, setFileName] = useState("large_test_file.bin");
  const [generatedSize, setGeneratedSize] = useState(100); // MB

  // Refs to manage download state across renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const downloadedChunksRef = useRef<ArrayBuffer[]>([]);
  const currentOffsetRef = useRef(0);

  // Generate a new test file
  async function handleGenerateFile() {
    try {
      setIsDownloading(false);
      setIsPaused(false);
      isPausedRef.current = false;
      setIsComplete(false);
      setDownloadProgress(0);
      setDownloadedSize(0);
      setError(null);
      downloadedChunksRef.current = [];
      currentOffsetRef.current = 0;

      const result = await generateFile(generatedSize, fileName);
      setFileInfo(result);
    } catch (e) {
      setError("Failed to generate file");
      console.error(e);
    }
  }

  // Start or resume download
  async function startDownload() {
    if (!fileInfo) return;

    setIsDownloading(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setError(null);

    // If starting from scratch
    if (currentOffsetRef.current === 0) {
      downloadedChunksRef.current = [];
    }

    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalSize = fileInfo.size;

    while (currentOffsetRef.current < totalSize) {
      // Check if paused
      if (isPausedRef.current) {
        setIsDownloading(false);
        return;
      }

      try {
        const start = currentOffsetRef.current;
        const end = Math.min(start + chunkSize - 1, totalSize - 1);

        const { data } = await downloadFileChunk(fileInfo.filename, start, end);

        // Store chunk
        downloadedChunksRef.current.push(data);
        currentOffsetRef.current += data.byteLength;
        setDownloadedSize(currentOffsetRef.current);

        // Update progress
        const progress = Math.min(
          100,
          (currentOffsetRef.current / totalSize) * 100,
        );
        setDownloadProgress(progress);

        // Check completion
        if (currentOffsetRef.current >= totalSize) {
          setIsComplete(true);
          setIsDownloading(false);
          assemblingFile();
          break;
        }

        // Small delay to make UI updates visible and simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.error(e);
        setError("Download failed. Click resume to try again.");
        setIsDownloading(false);
        break;
      }
    }
  }

  function pauseDownload() {
    setIsPaused(true);
    isPausedRef.current = true;
    setIsDownloading(false);
  }

  function assemblingFile() {
    // In a real app, we'd potentially stream this to disk or use FileSystem API
    // Here we'll just create a blob url for the user to save
    const blob = new Blob(downloadedChunksRef.current, {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);

    // Auto trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileInfo?.filename || "download.bin";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    // Initial load
    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Resumable Download
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Test large file downloads with pause, resume, and recovery
          capabilities.
        </p>
      </header>

      {/* Generator Section */}
      <div
        className="glass-panel"
        style={{ padding: "1.5rem", marginBottom: "2rem" }}
      >
        <h3
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FileBox size={20} color="var(--accent-primary)" />
          1. Generate Test File
        </h3>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              Filename
            </label>
            <input
              className="input-field"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. test_data.bin"
            />
          </div>
          <div style={{ width: "120px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              Size (MB)
            </label>
            <input
              type="number"
              className="input-field"
              value={generatedSize}
              onChange={(e) => setGeneratedSize(Number(e.target.value))}
              min="1"
              max="500"
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleGenerateFile}
            style={{ marginBottom: "1px" }}
          >
            Generate
          </button>
        </div>

        {fileInfo && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <CheckCircle2 size={24} color="var(--success)" />
            <div>
              <div style={{ fontWeight: 600, color: "var(--success)" }}>
                File Ready
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                {fileInfo.filename} ({(fileInfo.size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  marginTop: "0.25rem",
                  opacity: 0.7,
                }}
              >
                SHA256: {fileInfo.hash?.substring(0, 20)}...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Section */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem",
          opacity: fileInfo ? 1 : 0.5,
          pointerEvents: fileInfo ? "auto" : "none",
        }}
      >
        <h3
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Download size={20} color="var(--accent-primary)" />
          2. Download Manager
        </h3>

        {/* Progress Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <span>Progress</span>
            <span>{downloadProgress.toFixed(1)}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${downloadProgress}%`,
                height: "100%",
                background: isComplete
                  ? "var(--success)"
                  : "var(--accent-primary)",
                transition: "width 0.2s linear",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            <span>
              {(downloadedSize / 1024 / 1024).toFixed(2)} MB downloaded
            </span>
            <span>
              Total: {((fileInfo?.size || 0) / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {!isDownloading && !isComplete && (
            <button
              className="btn-primary"
              onClick={startDownload}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Play size={18} />
              {downloadedSize > 0 ? "Resume Download" : "Start Download"}
            </button>
          )}

          {isDownloading && (
            <button
              className="btn-danger" /* Using danger style for pause to make it distinct */
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "var(--warning)",
                borderColor: "rgba(245, 158, 11, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onClick={pauseDownload}
            >
              <Pause size={18} />
              Pause
            </button>
          )}

          {isComplete && (
            <button
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(16, 185, 129, 0.1)",
                borderColor: "var(--success)",
                color: "var(--success)",
                cursor: "default",
              }}
            >
              <CheckCircle2 size={18} />
              Download Complete
            </button>
          )}

          <button
            className="glass-panel"
            onClick={() => {
              setDownloadProgress(0);
              setDownloadedSize(0);
              setIsComplete(false);
              setIsPaused(false);
              setIsDownloading(false);
              downloadedChunksRef.current = [];
              currentOffsetRef.current = 0;
            }}
            title="Reset Download"
            style={{ padding: "0.75rem" }}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "8px",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <AlertTriangle size={20} />
            {error}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <h4
          style={{
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <HardDrive size={18} color="var(--text-secondary)" />
          Technicals
        </h4>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          This demo uses the <strong>HTTP Range</strong> header (RFC 7233) to
          request specific byte chunks from the server. The backend supports{" "}
          <code>Pending 206 Partial Content</code> responses. When you pause, we
          store the current offset. When you resume, we request bytes starting
          from <code>offset</code> to <code>end</code>.
        </p>
      </div>
    </div>
  );
}
