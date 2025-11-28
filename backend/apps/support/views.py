import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

class FeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        issue_type = request.data.get('issue_type')
        description = request.data.get('description')
        
        if not issue_type or not description:
            return Response(
                {"error": "Both issue_type and description are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get GitHub credentials from environment variables
        # User specified GH_TOKEN and GH_REPO
        github_token = os.environ.get('GH_TOKEN')
        github_repo = os.environ.get('GH_REPO')

        if not github_token or not github_repo:
            return Response(
                {"error": "GitHub configuration is missing on the server."}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Construct the issue title and body
        user = request.user
        title = f"[{issue_type}] Feedback from {user.username}"
        body = f"""
**Reporter:** {user.username} ({user.email})
**Type:** {issue_type}

**Description:**
{description}

---
*This issue was automatically created via the Fleet Management System Feedback Widget.*
        """

        # GitHub API URL
        url = f"https://api.github.com/repos/{github_repo}/issues"
        
        headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        payload = {
            "title": title,
            "body": body,
            "labels": ["feedback", issue_type.lower()]
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return Response({"message": "Feedback submitted successfully!", "issue_url": response.json().get("html_url")}, status=status.HTTP_201_CREATED)
        except requests.exceptions.RequestException as e:
            # Log the error here if logging was set up
            print(f"GitHub API Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"GitHub Response: {e.response.text}")
            return Response(
                {"error": "Failed to create issue on GitHub."}, 
                status=status.HTTP_502_BAD_GATEWAY
            )
