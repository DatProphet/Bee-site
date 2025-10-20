from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# PayPal setup
paypal_client_id = os.environ.get('PAYPAL_CLIENT_ID', 'test-client-id')
paypal_secret = os.environ.get('PAYPAL_SECRET', 'test-secret')
environment = SandboxEnvironment(client_id=paypal_client_id, client_secret=paypal_secret)
paypal_client = PayPalHttpClient(environment)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # honey, wax, queens, nucs, candles
    price: float
    description: str
    stock: int
    image_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    description: str
    stock: int
    image_url: str

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: str

class ServiceCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author: str
    image_url: str
    tags: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title: str
    content: str
    author: str
    image_url: str
    tags: List[str]

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class OrderItem(BaseModel):
    id: str
    name: str
    type: str  # product or service
    price: float
    quantity: int

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    items: List[OrderItem]
    total: float
    payment_status: str = "pending"  # pending, completed, failed
    paypal_order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    items: List[OrderItem]
    total: float

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminRegister(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class PayPalOrderCreate(BaseModel):
    order_id: str  # Our internal order ID

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Golden Hive Apiary API"}

# Product routes
@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

# Service routes
@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

# Blog routes
@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts():
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return posts

@api_router.get("/blog/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return post

@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate, token: dict = Depends(verify_token)):
    post = BlogPost(**post_data.model_dump())
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_posts.insert_one(doc)
    return post

@api_router.put("/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostUpdate, token: dict = Depends(verify_token)):
    existing_post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_data = {k: v for k, v in post_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    updated_post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    
    if isinstance(updated_post.get('created_at'), str):
        updated_post['created_at'] = datetime.fromisoformat(updated_post['created_at'])
    if isinstance(updated_post.get('updated_at'), str):
        updated_post['updated_at'] = datetime.fromisoformat(updated_post['updated_at'])
    
    return updated_post

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, token: dict = Depends(verify_token)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted"}

# Admin routes
@api_router.post("/admin/register")
async def register_admin(admin_data: AdminRegister):
    # Check if admin already exists
    existing = await db.admin_users.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    hashed_password = pwd_context.hash(admin_data.password)
    admin = AdminUser(email=admin_data.email, password_hash=hashed_password)
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admin_users.insert_one(doc)
    
    token = create_access_token({"email": admin.email, "id": admin.id})
    return {"token": token, "email": admin.email}

@api_router.post("/admin/login")
async def login_admin(login_data: AdminLogin):
    admin = await db.admin_users.find_one({"email": login_data.email})
    if not admin or not pwd_context.verify(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"email": admin['email'], "id": admin['id']})
    return {"token": token, "email": admin['email']}

# Order routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    order = Order(**order_data.model_dump())
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return order

# PayPal routes
@api_router.post("/paypal/create-order")
async def create_paypal_order(order_data: PayPalOrderCreate):
    # Get our order
    order = await db.orders.find_one({"id": order_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    request = OrdersCreateRequest()
    request.prefer('return=representation')
    request.request_body({
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": order_data.order_id,
            "amount": {
                "currency_code": "USD",
                "value": str(order['total'])
            }
        }]
    })
    
    try:
        response = paypal_client.execute(request)
        # Update order with PayPal order ID
        await db.orders.update_one(
            {"id": order_data.order_id},
            {"$set": {"paypal_order_id": response.result.id}}
        )
        return {"paypal_order_id": response.result.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal error: {str(e)}")

@api_router.post("/paypal/capture-order/{paypal_order_id}")
async def capture_paypal_order(paypal_order_id: str):
    request = OrdersCaptureRequest(paypal_order_id)
    
    try:
        response = paypal_client.execute(request)
        # Update our order status
        await db.orders.update_one(
            {"paypal_order_id": paypal_order_id},
            {"$set": {"payment_status": "completed"}}
        )
        return {"status": "success", "details": response.result}
    except Exception as e:
        await db.orders.update_one(
            {"paypal_order_id": paypal_order_id},
            {"$set": {"payment_status": "failed"}}
        )
        raise HTTPException(status_code=500, detail=f"PayPal capture error: {str(e)}")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize sample data on startup
@app.on_event("startup")
async def init_data():
    # Check if data already exists
    product_count = await db.products.count_documents({})
    if product_count == 0:
        # Add sample products
        sample_products = [
            {"id": str(uuid.uuid4()), "name": "Raw Wildflower Honey", "category": "honey", "price": 15.99, "description": "Pure, unfiltered wildflower honey harvested from local hives. Rich, complex flavor profile with notes of various wildflowers.", "stock": 50, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Wildflower+Honey", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Orange Blossom Honey", "category": "honey", "price": 18.99, "description": "Light, citrusy honey with delicate orange blossom notes. Perfect for tea and desserts.", "stock": 30, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Orange+Blossom", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Beeswax Candles (Pair)", "category": "candles", "price": 24.99, "description": "Hand-rolled pure beeswax candles. Burns clean with a natural honey scent. Set of 2.", "stock": 40, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Beeswax+Candles", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Pure Beeswax Block", "category": "wax", "price": 12.99, "description": "1 lb block of filtered beeswax. Perfect for crafts, cosmetics, and wood finishing.", "stock": 25, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Beeswax+Block", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Italian Queen Bee", "category": "queens", "price": 45.00, "description": "Mated Italian queen bee. Known for gentle temperament and excellent honey production.", "stock": 10, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Queen+Bee", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "5-Frame Nuc", "category": "nucs", "price": 175.00, "description": "Established 5-frame nucleus colony with laying queen, brood, and bees. Ready to expand.", "stock": 5, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Nucleus+Colony", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.products.insert_many(sample_products)
        
        # Add sample services
        sample_services = [
            {"id": str(uuid.uuid4()), "name": "Beekeeping Consultation", "description": "One-on-one consultation for new or experienced beekeepers. Includes hive inspection and personalized advice.", "price": 85.00, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Consultation"},
            {"id": str(uuid.uuid4()), "name": "Pollination Services", "description": "Professional pollination services for orchards, farms, and gardens. Pricing per acre.", "price": 150.00, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Pollination"},
            {"id": str(uuid.uuid4()), "name": "Hive Installation", "description": "Complete hive setup and installation service. Includes equipment setup and initial colony placement.", "price": 200.00, "image_url": "https://via.placeholder.com/400x300/1a1a1a/FFD700?text=Hive+Setup"},
        ]
        await db.services.insert_many(sample_services)
        
        # Add sample blog posts
        sample_posts = [
            {"id": str(uuid.uuid4()), "title": "Getting Started with Beekeeping", "content": "Beekeeping is a rewarding hobby that benefits both you and the environment. Here's what you need to know to get started...\n\nFirst, research local regulations and requirements. Many areas require registration and may have restrictions on hive placement. Check with your local agricultural extension office.\n\nNext, invest in quality equipment. A basic starter kit should include a hive, protective gear, smoker, and hive tool. Don't skimp on safety - a good bee suit is essential.\n\nChoose the right location. Bees need sunlight, wind protection, and a water source nearby. Face hives southeast for morning sun, and ensure you have permission if placing them on property that isn't yours.\n\nStart in spring. This gives your colony the entire season to build up stores for winter. Order your bees early - many suppliers sell out quickly.", "author": "Sarah Mitchell", "image_url": "https://via.placeholder.com/800x400/1a1a1a/FFD700?text=Beekeeping+Guide", "tags": ["beginner", "guide", "equipment"], "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Understanding the Honey Bee Life Cycle", "content": "The life cycle of a honey bee is fascinating and understanding it is key to successful beekeeping.\n\nQueen bees live 2-5 years and are the only bee in the hive that lays eggs. She can lay up to 2,000 eggs per day during peak season. The queen is larger than other bees and has a longer abdomen.\n\nWorker bees are female but don't reproduce. They live about 6 weeks in summer and perform different jobs as they age - from nursing young bees to foraging for nectar and pollen. Winter bees can live several months.\n\nDrones are male bees whose only purpose is to mate with queens from other hives. They don't have stingers and don't collect nectar. Hives produce them in spring and summer but drive them out before winter.\n\nThe development from egg to adult takes 21 days for workers, 24 days for drones, and only 16 days for queens.", "author": "Mike Henderson", "image_url": "https://via.placeholder.com/800x400/1a1a1a/FFD700?text=Bee+Life+Cycle", "tags": ["education", "biology", "colony"], "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(), "updated_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Seasonal Beekeeping Tasks", "content": "Beekeeping is a year-round commitment. Here's what to expect each season:\n\nSpring: This is your busiest time. Inspect hives every 7-10 days. Look for signs of disease, ensure the queen is laying, and add supers for honey production. This is also swarm season - stay vigilant!\n\nSummer: Continue regular inspections but be mindful of heat stress. Ensure bees have adequate ventilation and water access. Harvest honey in late summer. Monitor for pests like varroa mites.\n\nFall: Prepare hives for winter. Reduce entrances to prevent robbing. Treat for mites if necessary. Ensure each hive has 60-90 lbs of stored honey for winter. Combine weak colonies.\n\nWinter: Minimize disturbances. Check periodically that entrances aren't blocked by snow. On warm days (above 50°F), you can do quick checks. Never open hives in cold weather.", "author": "Sarah Mitchell", "image_url": "https://via.placeholder.com/800x400/1a1a1a/FFD700?text=Seasonal+Tasks", "tags": ["maintenance", "guide", "seasons"], "created_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat(), "updated_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat()},
        ]
        await db.blog_posts.insert_many(sample_posts)
        
        logger.info("Sample data initialized")