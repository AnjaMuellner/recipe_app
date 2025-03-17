from pydantic import BaseModel
from typing import Optional

class CookbookRecipeFeedback(BaseModel):
    id: int
    rating: Optional[float] = None
    comment: Optional[str] = None

    class Config:
        from_attributes = True