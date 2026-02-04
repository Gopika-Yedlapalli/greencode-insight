import os
from app.parsers.python import parse_python
from app.parsers.java import parse_java
from app.analysers.python_comments import analyze_python_comments
from app.analysers.java_comments import analyze_java_comments

EXCLUDED_DIRS = {
    "venv", "node_modules", ".git", "__pycache__", "build", "dist"
}

def analyze_codebase(path: str):
    results = []

    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        for file in files:
            if not file.endswith((".py", ".java")):
                continue

            file_path = os.path.join(root, file)

            try:
                with open(file_path, "r", errors="ignore") as f:
                    code = f.read()
            except OSError:
                continue

            if file.endswith(".py"):
                parsed = parse_python(code)
                comments = analyze_python_comments(parsed)
                language = "python"
            else:
                parsed = parse_java(code)
                comments = analyze_java_comments(parsed)
                language = "java"

            results.append({
                "file": file,
                "language": language,
                "analysis": {
                    "comments": comments,
                }
            })

    return results
