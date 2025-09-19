document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const uploadForm = document.getElementById('uploadForm');
    const results = document.getElementById('results');
    const spinner = document.getElementById('spinner');
    const documentType = document.getElementById('documentType');
    const confidence = document.getElementById('confidence');
    const missingFieldsList = document.getElementById('missingFieldsList');

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2980b9';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#3498db';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3498db';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            handleFile(file);
        }
    });

    // Handle click upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    function handleFile(file) {
        const dropZoneText = document.querySelector('.drop-zone-text');
        dropZoneText.textContent = file.name;
        analyzeBtn.disabled = false;
    }

    // Handle form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) return;

        // Show spinner and hide results
        spinner.style.display = 'flex';
        results.style.display = 'none';
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch('/api/documents/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Update results
                documentType.textContent = data.type.charAt(0).toUpperCase() + data.type.slice(1);
                confidence.textContent = `Confidence: ${Math.round(data.confidence * 100)}%`;
                
                // Clear and update missing fields list
                missingFieldsList.innerHTML = '';
                data.missingFields.forEach(field => {
                    const li = document.createElement('li');
                    li.textContent = `${field.name} (${field.importance})`;
                    missingFieldsList.appendChild(li);
                });

                // Show results
                results.style.display = 'block';
            } else {
                alert(data.error || 'Error processing document');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing document');
        } finally {
            spinner.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    });
});