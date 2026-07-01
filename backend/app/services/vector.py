import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class VectorService:
    """Core Vector service wrapping ChromaDB and local SentenceTransformers embeddings."""
    def __init__(self):
        # Initialize the embedding model locally
        model_name = os.getenv('EMBEDDINGS_MODEL_NAME', 'all-MiniLM-L6-v2')
        logger.info(f"Loading local SentenceTransformer model: {model_name}...")
        self.embedding_model = SentenceTransformer(model_name)
        
        # Connect to ChromaDB
        chroma_host = os.getenv('CHROMA_HOST')
        chroma_port = os.getenv('CHROMA_PORT', '8000')
        
        if chroma_host:
            logger.info(f"Connecting to remote ChromaDB server at {chroma_host}:{chroma_port}")
            self.client = chromadb.HttpClient(host=chroma_host, port=int(chroma_port))
        else:
            persist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'chroma_data')
            logger.info(f"Connecting to persistent local ChromaDB instance at {persist_dir}")
            self.client = chromadb.PersistentClient(path=persist_dir)

    def get_or_create_collection(self, name: str):
        """Retrieve or construct a target collection segment."""
        return self.client.get_or_create_collection(name=name)

    def add_documents(self, collection_name: str, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]]):
        """Embeds text and stores chunks within ChromaDB collection."""
        collection = self.get_or_create_collection(collection_name)
        
        # Generate embeddings locally using SentenceTransformers
        embeddings = self.embedding_model.encode(documents).tolist()
        
        # Add to Chroma collection
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def query_similarity(
        self, 
        collection_name: str, 
        query_text: str, 
        n_results: int = 3, 
        where_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Queries the vector database for matching nodes using similarity embeddings."""
        collection = self.get_or_create_collection(collection_name)
        
        # Embed query text
        query_embeddings = self.embedding_model.encode([query_text]).tolist()
        
        results = collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results,
            where=where_filter
        )
        
        formatted_results = []
        if results and results.get('documents'):
            docs = results['documents'][0]
            metas = results['metadatas'][0] if results.get('metadatas') else [{}] * len(docs)
            distances = results['distances'][0] if results.get('distances') else [0.0] * len(docs)
            ids = results['ids'][0]
            
            for i in range(len(docs)):
                formatted_results.append({
                    "id": ids[i],
                    "document": docs[i],
                    "metadata": metas[i],
                    "distance": distances[i],
                    "score": 1.0 - float(distances[i])  # Simple normalized score representation
                })
                
        return formatted_results

    def reset_database(self):
        """Flushes all collection segments from database."""
        try:
            self.client.reset()
            logger.info("ChromaDB vector registry reset successfully.")
        except Exception as e:
            logger.warning(f"ChromaDB reset command skipped: {e} (Chroma reset must be enabled via server config)")
