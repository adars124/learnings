from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Models
# --------------------


class CreateItem(BaseModel):
    name: str
    price: float
    quantity: int


class UpdateItem(BaseModel):
    name: str | None = None
    price: float | None = None
    quantity: int | None = None


# --------------------
# "Database"
# --------------------

db: list[dict] = [
    {"id": 1, "name": "Gilmour 1500 Edition Ibanez", "price": 400000, "quantity": 2},
    {"id": 2, "name": "Hendrix 2400 Edition", "price": 330000, "quantity": 4},
    {"id": 3, "name": "Clapton Squier 2900", "price": 30000, "quantity": 10},
]


def get_next_id() -> int:
    return max(item["id"] for item in db) + 1 if db else 1


# --------------------
# Routes
# --------------------


@app.get("/")
def root():
    return {"message": "Hello World!"}


# READ
@app.get("/list-items")
def list_items():
    return db


# CREATE
@app.post("/create-item")
def create_item(item: CreateItem):
    new_item = {
        "id": get_next_id(),
        "name": item.name,
        "price": item.price,
        "quantity": item.quantity,
    }

    db.append(new_item)
    return new_item


# UPDATE
@app.put("/update-item/{item_id}")
def update_item(item_id: int, item: UpdateItem):
    for db_item in db:
        if db_item["id"] == item_id:
            if item.name is not None:
                db_item["name"] = item.name
            if item.price is not None:
                db_item["price"] = item.price
            if item.quantity is not None:
                db_item["quantity"] = item.quantity

            return {
                "message": "Item updated successfully",
                "item": db_item,
            }

    return {"message": "Item not found"}


# DELETE
@app.delete("/delete-item/{item_id}")
def delete_item(item_id: int):
    for db_item in db:
        if db_item["id"] == item_id:
            db.remove(db_item)
            return {
                "message": "Item deleted successfully",
                "item": db_item,
            }

    return {"message": "Item not found"}


# --------------------
# Run server
# --------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
