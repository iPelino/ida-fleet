import requests
import json

BASE_URL = "http://localhost:8000/api"

def print_response(response, label):
    print(f"\n--- {label} ---")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def run_verification():
    # 1. Signup
    print("1. Testing Signup...")
    signup_data = {
        "email": "test@example.com",
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "role": "admin"
    }
    # Clean up if exists (mocking cleanup or just ignoring error)
    
    response = requests.post(f"{BASE_URL}/signup", json=signup_data)
    print_response(response, "Signup")
    
    if response.status_code == 201:
        token = response.json()['token']
    else:
        # Try login
        print("User might exist, trying login...")
        response = requests.post(f"{BASE_URL}/login", json={"email": "test@example.com", "password": "password123"})
        print_response(response, "Login")
        if response.status_code == 200:
            token = response.json()['token']
        else:
            print("Failed to get token.")
            return

    headers = {"Authorization": f"Token {token}"}

    # 2. Create Vehicle
    print("\n2. Testing Create Vehicle...")
    vehicle_data = {
        "make": "Toyota",
        "model": "Hilux",
        "year": 2022,
        "licensePlate": "RAB 123 A",
        "currentMileage": 15000,
        "status": "Active"
    }
    response = requests.post(f"{BASE_URL}/vehicles/", json=vehicle_data, headers=headers)
    print_response(response, "Create Vehicle")
    vehicle_id = response.json().get('id')

    # 3. Create Customer
    print("\n3. Testing Create Customer...")
    customer_data = {
        "name": "Acme Corp",
        "email": "contact@acme.com",
        "phone": "+250788888888"
    }
    response = requests.post(f"{BASE_URL}/customers/", json=customer_data, headers=headers)
    print_response(response, "Create Customer")
    customer_id = response.json().get('id')

    # 4. Create Trip
    if vehicle_id and customer_id:
        print("\n4. Testing Create Trip...")
        trip_data = {
            "customer": customer_id,
            "vehicle": vehicle_id,
            "description": "Delivery to Kigali",
            "startDate": "2023-11-25T10:00:00Z",
            "endDate": "2023-11-25T14:00:00Z",
            "totalPrice": 50000
        }
        response = requests.post(f"{BASE_URL}/trips/", json=trip_data, headers=headers)
        print_response(response, "Create Trip")
        trip_id = response.json().get('id')

        # 5. Add Payment
        if trip_id:
            print("\n5. Testing Add Payment...")
            payment_data = {
                "amount": 20000,
                "date": "2023-11-25T12:00:00Z",
                "type": "Cash"
            }
            response = requests.post(f"{BASE_URL}/trips/{trip_id}/payments/", json=payment_data, headers=headers)
            print_response(response, "Add Payment")

    # 6. Add Expense
    if vehicle_id:
        print("\n6. Testing Add Expense...")
        expense_data = {
            "vehicle": vehicle_id,
            "category": "Fuel",
            "amount": 50000,
            "date": "2023-11-25T09:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/expenses/", json=expense_data, headers=headers)
        print_response(response, "Add Expense")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Verification failed: {e}")
