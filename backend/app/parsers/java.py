import javalang
from typing import Dict, Any, List


def parse_java(code: str) -> Dict[str, Any]:
    """
    Parses Java source code and extracts:
    - class declarations
    - method declarations
    - comments
    """

    classes: List[Dict[str, Any]] = []
    methods: List[Dict[str, Any]] = []
    comments: List[str] = []

    try:
        tree = javalang.parse.parse(code)

        for path, node in tree:
            if isinstance(node, javalang.tree.ClassDeclaration):
                classes.append({
                    "name": node.name,
                    "line": node.position.line if node.position else None
                })

            elif isinstance(node, javalang.tree.MethodDeclaration):
                methods.append({
                    "name": node.name,
                    "line": node.position.line if node.position else None
                })

    except (javalang.parser.JavaSyntaxError, IndexError):
        pass

    try:
        for token in javalang.tokenizer.tokenize(code):
            if isinstance(token, javalang.tokenizer.Comment):
                comments.append(token.value)
    except Exception:
        pass

    return {
        "classes": classes,
        "methods": methods,
        "comments": comments
    }
