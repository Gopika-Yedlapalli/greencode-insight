import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import FormError from "../components/FormError";
import "../assets/analysis.css";

export default function Analysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFilesSelected = (newFiles) => {
    if (repoUrl.trim()) {
      setErrorMessage(
        "Please analyse either a GitHub repository or uploaded files, not both."
      );
      return;
    }

    if (files.length + newFiles.length > 5) {
      setErrorMessage("You can upload a maximum of 5 files.");
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage("");
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (repoUrl.trim() && files.length > 0) {
      setErrorMessage(
        "Please analyse either a GitHub repository or uploaded files, not both."
      );
      return;
    }

    if (!repoUrl.trim() && files.length === 0) {
      setErrorMessage("Provide a GitHub URL or upload at least one file.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      let response;

      if (repoUrl.trim()) {
        response = await api.post("/github/analyze", null, {
          params: { repo_url: repoUrl },
        });
      } else {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        response = await api.post("/analysis/upload", formData);
      }

      navigate(`/results/${response.data.analysis_id}`);
    } catch (err) {
      const backendCode = err.response?.data?.detail;

      switch (backendCode) {
        case "invalid_url":
          setErrorMessage(
            "Please add a valid GitHub repository URL (for example: https://github.com/user/repo)."
          );
          break;

        case "not_github":
          setErrorMessage(
            "Only GitHub repositories are supported. Please provide a GitHub repository URL."
          );
          break;

        case "repo_not_accessible":
          setErrorMessage(
            "Please provide a public GitHub repository. Private or non-existent repositories cannot be analysed."
          );
          break;

        default:
          setErrorMessage(
            backendCode || "Analysis failed. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <button
          type="button"
          className="card-close"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          ✕
        </button>

        <h1>Code Analysis</h1>
        <p className="auth-subtitle">
          Analyze a GitHub repository or upload source files
        </p>

        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={submit}>
          <input
            type="text"
            placeholder="GitHub repository URL"
            value={repoUrl}
            onChange={(e) => {
              if (files.length > 0) {
                setErrorMessage(
                  "Please analyse either uploaded files or a GitHub repository, not both."
                );
                return;
              }
              setRepoUrl(e.target.value);
              setErrorMessage("");
            }}
            disabled={loading}
          />

          <p className="analysis-or">OR</p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".py,.java"
            className="file-input-hidden"
            disabled={loading}
            onChange={(e) =>
              handleFilesSelected([...e.target.files])
            }
          />

          <button
            type="button"
            className="file-trigger"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Choose source files
          </button>

          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, index) => (
                <li key={index}>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={loading}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyse"}
          </button>
        </form>
      </div>
    </div>
  );
}
