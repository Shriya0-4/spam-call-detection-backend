function toggleConversationInput(option) {
    const audioInput = document.getElementById('audioInput');
    const textInput = document.getElementById('textInput');
    
    if (option === 'audio') {
      audioInput.classList.remove('hidden');
      textInput.classList.add('hidden');
      textInput.value = ''; 
    } else if (option === 'text') {
      textInput.classList.remove('hidden');
      audioInput.classList.add('hidden');
      audioInput.value = ''; 
    }
  }
  
  document.getElementById('callReportForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const phoneNumber = document.getElementById('phoneNumber').value;
    const audioInput = document.getElementById('audioInput').files;
    const textInput = document.getElementById('textInput').value.trim();
  
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
  
    if (audioInput.length === 0 && textInput === "") {
      alert("Please provide either an audio file or a text conversation.");
      return;
    }
  
    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    formData.append('callTimings', document.getElementById('callTimings').value);
    formData.append('callDuration', document.getElementById('callDuration').value);
    formData.append('frequencyPerDay', document.getElementById('frequencyPerDay').value);
    formData.append('frequencyPerWeek', document.getElementById('frequencyPerWeek').value);
  
    if (audioInput.length > 0) {
      formData.append('audio', audioInput[0]); 
    } else {
      formData.append('conversationText', textInput);
    }
  
    try {
  
      const response = await fetch('http://localhost:3000/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Report submitted successfully! Transcription: ' + (result.transcription || 'N/A'));
      } else {
        alert('Error: ' + (result.error || 'Something went wrong!'));
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  
    this.reset();
    document.getElementById('audioInput').classList.add('hidden'); 
    document.getElementById('textInput').classList.add('hidden');  
  });
  