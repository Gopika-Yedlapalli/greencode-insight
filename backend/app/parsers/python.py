import ast
import tokenize
from io import BytesIO
from typing import Dict, Any


def parse_python(code: str) -> Dict[str, Any]:
    """
    Parses Python source code and extracts:
    - file-level docstring
    - class definitions with line ranges
    - function definitions with line ranges
    - inline comments
    """

    tree = ast.parse(code)

    result = {
        "functions": [],
        "classes": [],
        "docstrings": [],
        "inline_comments": []
    }

    file_doc = ast.get_docstring(tree)
    if file_doc:
        result["docstrings"].append({
            "scope": "file",
            "text": file_doc
        })

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            result["functions"].append({
                "name": node.name,
                "start_line": node.lineno,
                "end_line": getattr(node, "end_lineno", node.lineno),
                "docstring": ast.get_docstring(node)
            })

        elif isinstance(node, ast.ClassDef):
            result["classes"].append({
                "name": node.name,
                "start_line": node.lineno,
                "end_line": getattr(node, "end_lineno", node.lineno),
                "docstring": ast.get_docstring(node)
            })

    try:
        tokens = tokenize.tokenize(BytesIO(code.encode()).readline)
        for token in tokens:
            if token.type == tokenize.COMMENT:
                result["inline_comments"].append(
                    token.string.lstrip("# ").strip()
                )
    except tokenize.TokenError:
        pass

    return result
