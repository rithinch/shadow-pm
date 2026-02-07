from azure.cosmos import CosmosClient, PartitionKey, exceptions
from typing import Optional, Dict, Any, List
import logging
import uuid

from core.config import settings

logger = logging.getLogger(__name__)


class ContainerConfig:
    """Configuration for a Cosmos DB container"""
    def __init__(self, name: str, partition_key: str):
        self.name = name
        self.partition_key = partition_key


# Container configuration for meetings
MEETINGS_CONTAINER = ContainerConfig(
    name="meetings",
    partition_key="/id"
)


class CosmosDBClient:
    """Singleton Cosmos DB client for meetings container"""
    
    _instance: Optional["CosmosDBClient"] = None
    _client: Optional[CosmosClient] = None
    _database = None
    _meetings_container = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Cosmos DB client (only once)"""
        if self._client is None and settings.cosmos_connection_string:
            try:
                self._client = CosmosClient.from_connection_string(
                    settings.cosmos_connection_string
                )
                logger.info("Cosmos DB client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Cosmos DB client: {e}")
                raise
    
    async def initialize_containers(self):
        """Create database and meetings container if they don't exist"""
        if not self._client:
            logger.warning("Cosmos DB client not initialized - connection string not provided")
            return
        
        try:
            # Create database if it doesn't exist
            self._database = self._client.create_database_if_not_exists(
                id=settings.cosmos_database_name
            )
            logger.info(f"Database '{settings.cosmos_database_name}' ready")
            
            # Create meetings container
            self._meetings_container = self._database.create_container_if_not_exists(
                id=MEETINGS_CONTAINER.name,
                partition_key=PartitionKey(path=MEETINGS_CONTAINER.partition_key)
            )
            logger.info(f"Container '{MEETINGS_CONTAINER.name}' ready (partition key: {MEETINGS_CONTAINER.partition_key})")
            
        except exceptions.CosmosHttpResponseError as e:
            logger.error(f"Failed to initialize Cosmos DB containers: {e}")
            raise
    
    async def create_meeting(self, meeting_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a meeting item in the meetings container
        
        Args:
            meeting_data: The meeting data from Granola webhook
            
        Returns:
            The created meeting item
        """
        if not self._meetings_container:
            logger.warning("Meetings container not initialized - skipping creation")
            return meeting_data
        
        try:
            # Ensure the meeting has an id
            if "id" not in meeting_data:
                meeting_data["id"] = str(uuid.uuid4())
            
            created_item = self._meetings_container.create_item(body=meeting_data)
            logger.info(f"Created meeting: {meeting_data.get('id')}")
            return created_item
            
        except exceptions.CosmosResourceExistsError:
            # If item exists, upsert it
            logger.warning(f"Meeting {meeting_data.get('id')} already exists, upserting")
            upserted_item = self._meetings_container.upsert_item(body=meeting_data)
            return upserted_item
        except exceptions.CosmosHttpResponseError as e:
            logger.error(f"Failed to create meeting: {e}")
            raise
    
    async def get_all_meetings(self) -> List[Dict[str, Any]]:
        """
        Get all meetings from the meetings container
        
        Returns:
            List of all meeting items
        """
        if not self._meetings_container:
            logger.warning("Meetings container not initialized")
            return []
        
        try:
            query = "SELECT * FROM c"
            items = list(self._meetings_container.query_items(
                query=query,
                enable_cross_partition_query=True
            ))
            logger.info(f"Retrieved {len(items)} meetings")
            return items
        except exceptions.CosmosHttpResponseError as e:
            logger.error(f"Failed to retrieve meetings: {e}")
            raise
    
    @property
    def is_initialized(self) -> bool:
        """Check if Cosmos DB client is initialized"""
        return self._meetings_container is not None


# Global instance
cosmos_client = CosmosDBClient()
