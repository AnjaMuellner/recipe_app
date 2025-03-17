from sqlalchemy.ext.declarative import declarative_base, as_declarative

@as_declarative()
class Base:
    id: any
    __name__: str