from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

@app.route("/quote", methods=["POST"])
def get_mock_quote():
    try:
        data = request.get_json()

        age = data.get("age")
        smoker = data.get("smoker")
        coverage = data.get("coverage")
        term = data.get("term_years")

        # 🔁 Simple mock logic to simulate premium calculation
        base_rate = 0.03
        age_penalty = (age - 25) * 0.002 if age > 25 else 0
        smoker_penalty = 0.015 if smoker else 0
        total_rate = base_rate + age_penalty + smoker_penalty

        annual_premium = coverage * total_rate * (term / 10)

        return jsonify({
            "quote": round(annual_premium, 2),
            "details": f"Estimated premium for {age} y/o {'smoker' if smoker else 'non-smoker'} for {term} years."
        })

    except Exception as e:
        print("Quote error:", e)
        return jsonify({ "error": str(e) }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
