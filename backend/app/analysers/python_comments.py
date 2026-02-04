from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Dict, Any, List


def normalize(text: str) -> str:
    return re.sub(r"\W+", " ", text.lower()).strip()


def analyze_python_comments(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs full comment analysis for Python:
    - scope classification
    - density metrics
    - redundancy detection
    - over-commenting detection
    - rule-based conclusions
    """

    scoped_comments: List[Dict[str, Any]] = []

    for d in parsed.get("docstrings", []):
        scoped_comments.append({
            "scope": "file",
            "text": d["text"]
        })

    for f in parsed.get("functions", []):
        if f.get("docstring"):
            scoped_comments.append({
                "scope": "function",
                "owner": f["name"],
                "text": f["docstring"]
            })

    for c in parsed.get("classes", []):
        if c.get("docstring"):
            scoped_comments.append({
                "scope": "class",
                "owner": c["name"],
                "text": c["docstring"]
            })

    for inline in parsed.get("inline_comments", []):
        scoped_comments.append({
            "scope": "inline",
            "text": inline
        })

    total_comments = len(scoped_comments)
    total_functions = len(parsed.get("functions", [])) or 1

    comments_per_function = total_comments / total_functions

    texts = [normalize(c["text"]) for c in scoped_comments]
    duplicated_pairs = []

    if len(texts) > 1:
        tfidf = TfidfVectorizer().fit_transform(texts)
        sim = cosine_similarity(tfidf)

        for i in range(len(sim)):
            for j in range(i + 1, len(sim)):
                if sim[i][j] > 0.85:
                    duplicated_pairs.append(
                        (scoped_comments[i]["text"], scoped_comments[j]["text"])
                    )

    redundant_count = len(duplicated_pairs)

    over_commented = (
        comments_per_function > 2.5 and
        redundant_count > 0
    )

    if over_commented:
        conclusion = (
            "Over-commenting detected: high comment density with redundant comments. "
            "Refactoring or simplification is recommended."
        )
    elif redundant_count > 0:
        conclusion = "Redundant comments detected. Consider removing duplicated explanations."
    elif total_comments == 0:
        conclusion = "No comments found. Documentation may be insufficient."
    else:
        conclusion = "Comments are concise and appear meaningful."

    return {
        "total_comments": total_comments,
        "comments_by_scope": {
            "file": sum(1 for c in scoped_comments if c["scope"] == "file"),
            "class": sum(1 for c in scoped_comments if c["scope"] == "class"),
            "function": sum(1 for c in scoped_comments if c["scope"] == "function"),
            "inline": sum(1 for c in scoped_comments if c["scope"] == "inline"),
        },
        "comments_per_function": round(comments_per_function, 2),
        "redundant_comments": duplicated_pairs,
        "over_commented": over_commented,
        "conclusion": conclusion
    }
