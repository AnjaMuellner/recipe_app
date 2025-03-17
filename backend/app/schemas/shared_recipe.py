from pydantic import BaseModel

class SharedRecipe(BaseModel):
    id: int
    recipe_id: int
    shared_with_user_id: int

    class Config:
        orm_mode: True