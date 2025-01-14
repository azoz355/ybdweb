from flask import Flask, render_template, request, send_file, jsonify
import yt_dlp
import os
import time
import shutil

app = Flask(__name__)

def safe_remove_file(file_path, max_attempts=5):
    for i in range(max_attempts):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            break
        except:
            time.sleep(0.1)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/download', methods=['POST'])
def download():
    try:
        if not os.path.exists('temp'):
            os.makedirs('temp')

        url = request.form['url']
        quality = request.form['quality']

        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' if quality == 'high' else 'worst[ext=mp4]',
            'outtmpl': 'temp/%(title)s.%(ext)s',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_path = ydl.prepare_filename(info)

            try:
                return send_file(file_path, as_attachment=True)
            finally:
                safe_remove_file(file_path)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    if os.path.exists('temp'):
        shutil.rmtree('temp', ignore_errors=True)
    app.run(debug=True)