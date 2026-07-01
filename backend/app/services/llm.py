import os
import json
import logging
from typing import Optional, List, Dict, Any
import httpx

logger = logging.getLogger(__name__)

class BaseLLMClient:
    """Base class for pluggable LLM API providers."""
    async def generate(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        raise NotImplementedError

class OllamaClient(BaseLLMClient):
    """Local inference client utilizing Ollama."""
    def __init__(self, base_url: str = 'http://localhost:11434', model_name: str = 'qwen2.5:8b'):
        self.base_url = os.getenv('OLLAMA_BASE_URL', base_url).rstrip('/')
        self.model_name = os.getenv('LLM_MODEL_NAME', model_name)
        self.client = httpx.AsyncClient(timeout=60.0)

    async def generate(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        url = f"{self.base_url}/api/generate"
        
        # Assemble payload
        payload = {
            "model": self.model_name,
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }
        
        if json_mode:
            payload["format"] = "json"

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "").strip()
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            raise RuntimeError(f"Ollama connection error: {e}")

class OpenAICompatibleClient(BaseLLMClient):
    """Cloud API client utilizing OpenAI-compatible endpoints (Groq, Together, DeepSeek)."""
    def __init__(self, base_url: str, api_key: str, model_name: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.model_name = model_name
        self.client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=60.0
        )

    async def generate(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        url = f"{self.base_url}/chat/completions"
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})

        payload: Dict[str, Any] = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0.2
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.error(f"OpenAI-compatible generation failed: {e}")
            raise RuntimeError(f"API provider connection error: {e}")

def get_llm_client() -> BaseLLMClient:
    """Factory to retrieve client based on active environment config."""
    provider = os.getenv('LLM_PROVIDER', 'ollama').lower()
    
    if provider == 'ollama':
        return OllamaClient()
    else:
        # Load custom provider keys
        api_base = os.getenv('LLM_API_BASE')
        api_key = os.getenv('LLM_API_KEY')
        model_name = os.getenv('LLM_MODEL_NAME')
        
        if not api_base or not api_key or not model_name:
            logger.warning("LLM provider credentials missing. Falling back to local Ollama client.")
            return OllamaClient()
            
        return OpenAICompatibleClient(base_url=api_base, api_key=api_key, model_name=model_name)
