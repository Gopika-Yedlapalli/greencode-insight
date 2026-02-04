from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Dict, Any, List


def normalize(text: str) -> str:
    return re.sub(r"\W+", " ", text.lower()).strip()


def analyze_java_comments(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs full comment analysis for Java:
    - scope approximation
    - density metrics
    - redundancy detection
    - over-commenting detection
    - rule-based conclusions
    """

    comments: List[str] = parsed.get("comments", [])
    methods = parsed.get("methods", [])
    classes = parsed.get("classes", [])

    total_comments = len(comments)
    total_methods = len(methods) or 1

    comments_per_method = total_comments / total_methods

    duplicated_pairs = []

    if len(comments) > 1:
        tfidf = TfidfVectorizer().fit_transform(map(normalize, comments))
        sim = cosine_similarity(tfidf)

        for i in range(len(sim)):
            for j in range(i + 1, len(sim)):
                if sim[i][j] > 0.85:
                    duplicated_pairs.append((comments[i], comments[j]))

    redundant_count = len(duplicated_pairs)

    over_commented = (
        comments_per_method > 2.5 and
        redundant_count > 0
    )

    if over_commented:
        conclusion = (
            "Over-commenting detected: excessive documentation with duplicated comments. "
            "Simplifying code structure may reduce documentation overhead."
        )
    elif redundant_count > 0:
        conclusion = "Redundant Java comments detected. Consider consolidating documentation."
    elif total_comments == 0:
        conclusion = "No comments found. Java code may lack documentation."
    else:
        conclusion = "Java comments appear concise and well-placed."

    return {
        "total_comments": total_comments,
        "comments_per_method": round(comments_per_method, 2),
        "redundant_comments": duplicated_pairs,
        "over_commented": over_commented,
        "conclusion": conclusion
    }
