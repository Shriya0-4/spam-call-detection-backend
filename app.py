import os
from flask import Flask, request, jsonify,render_template
from dotenv import load_dotenv
from flask_cors import CORS
import requests
import whisper

app = Flask(__name__)
CORS(app);

load_dotenv()
OPENCAGE_API_KEY = os.getenv('OPENCAGE_API_KEY')


model = whisper.load_model("base")

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/get-location', methods=['GET'])
def get_location():
    city_code = request.args.get('city_code')
    city_names = {
        "305": "Miami, FL",
        "212": "New York, NY",
        "213": "Los Angeles, CA",
        "312": "Chicago, IL",
        "415": "San Francisco, CA",
    }
    current_location= city_names.get(city_code)
    if not current_location:
        return jsonify({"error": "Area code not found"})
    response = requests.get(f"https://api.opencagedata.com/geocode/v1/json?q={current_location}&key={OPENCAGE_API_KEY}")
    data = response.json()

    if len(data["results"]) > 0:
        lat = data["results"][0]["geometry"]["lat"]
        lng = data["results"][0]["geometry"]["lng"]
        return jsonify({"city": current_location, "latitude": lat, "longitude": lng})
    else:
        return jsonify({"error": "Location not found"}), 404

@app.route('/transcribe-audio', methods=['POST'])
def transcribe_audio():
    if 'audio' in request.files:
        audio_file = request.files['audio']
        audio_path = os.path.join('uploads', audio_file.filename)
        audio_file.save(audio_path)

        try:
            result = model.transcribe(audio_path)
            transcription = result['text']
            return jsonify({"transcription": transcription})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif 'conversationText' in request.form:
        conversation_text = request.form['conversationText']
        return jsonify({"transcription": conversation_text})

    else:
        return jsonify({"error": "No valid input provided"}), 400


if __name__ == "__main__":
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    app.run(debug=True,port=3000)