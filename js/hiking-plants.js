// hiking-plants.js - Google Sheets API integration for hiking plants data

class HikingPlantsLoader {
    constructor() {
        this.apiKey = null;
        this.spreadsheetId = null;
        this.sheetName = 'Sheet1';
        this.loadingElement = document.getElementById('loading-message');
        this.errorElement = document.getElementById('error-message');
        this.containerElement = document.getElementById('plants-container');
        this.tbodyElement = document.getElementById('plants-tbody');
    }

    // Load configuration - hardcoded for simplicity
    async loadConfig() {
        // Direct configuration - edit these values as needed
        this.spreadsheetId = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRGa4amn06lOkQgmga5kqmQnEwH3avKk5Sxgu5Kd2TcKKbZtTD4IOCu8yDfz-nF46vvilAf15tYirum/pub?output=csv';
        this.sheetName = 'Sheet1';

        if (!this.spreadsheetId) {
            throw new Error('Please configure your spreadsheet URL in the JavaScript file');
        }

        return true;
    }

    // Fetch data from Google Sheets via published CSV or Google Apps Script
    async fetchPlantsData() {
        try {
            // Option 1: Use published CSV URL
            const csvUrl = this.spreadsheetId.startsWith('http') ? 
                this.spreadsheetId : 
                `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=0`;
            
            try {
                const response = await fetch(csvUrl);
                if (response.ok) {
                    const csvText = await response.text();
                    return this.parseCSV(csvText);
                }
            } catch (csvError) {
                console.log('CSV fetch failed, trying Apps Script method...');
            }

            // Option 2: Use Google Apps Script Web App (requires setup)
            const webAppUrl = this.apiKey; // Reuse this field for web app URL
            if (webAppUrl && webAppUrl.includes('script.google.com')) {
                const response = await fetch(webAppUrl);
                if (!response.ok) {
                    throw new Error(`Apps Script request failed: ${response.status}`);
                }
                const data = await response.json();
                return data.values || data;
            }

            throw new Error('Please set up either CSV export or Google Apps Script web app. See instructions in .env file.');
            
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    // Parse CSV data into array format
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        return lines.map(line => {
            // Simple CSV parser - handles basic cases
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            return values;
        });
    }

    // Display plants data in the table
    displayPlants(rawData) {
        // First row should be headers, skip it for data
        const plants = rawData.slice(1);

        if (plants.length === 0) {
            this.showError('No plant data found in the spreadsheet');
            return;
        }

        // Clear existing content
        this.tbodyElement.innerHTML = '';

        // Add each plant as a table row
        plants.forEach((plant) => {
            const row = document.createElement('tr');
            
            // Expected columns: Name, Scientific Name, Location Found, Date Spotted, Notes, Photo
            const name = plant[0] || 'N/A';
            const scientificName = plant[1] || 'N/A';
            const location = plant[2] || 'N/A';
            const dateSpotted = plant[3] || 'N/A';
            const notes = plant[4] || 'N/A';
            const photo = plant[5] || '';

            let photoCell = 'No photo';
            if (photo && photo.trim()) {
                if (photo.startsWith('http')) {
                    // External URL
                    photoCell = `<a href="${photo}" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-external-link-alt"></i> View
                    </a>`;
                } else {
                    // Local file
                    photoCell = `<img src="${photo}" alt="${name}" class="plant-photo-thumbnail" style="max-width: 60px; max-height: 60px; object-fit: cover;">`;
                }
            }

            row.innerHTML = `
                <td><strong>${this.escapeHtml(name)}</strong></td>
                <td class="scientific-name">${this.escapeHtml(scientificName)}</td>
                <td>${this.escapeHtml(location)}</td>
                <td>${this.escapeHtml(dateSpotted)}</td>
                <td class="notes-cell" title="${this.escapeHtml(notes)}">${this.escapeHtml(notes)}</td>
                <td>${photoCell}</td>
            `;

            this.tbodyElement.appendChild(row);
        });

        this.showContent();
    }

    // Helper function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show loading state
    showLoading() {
        this.loadingElement.classList.remove('d-none');
        this.errorElement.classList.add('d-none');
        this.containerElement.classList.add('d-none');
    }

    // Show error state
    showError(message) {
        this.loadingElement.classList.add('d-none');
        this.containerElement.classList.add('d-none');
        this.errorElement.classList.remove('d-none');
        document.getElementById('error-text').textContent = message;
    }

    // Show content
    showContent() {
        this.loadingElement.classList.add('d-none');
        this.errorElement.classList.add('d-none');
        this.containerElement.classList.remove('d-none');
    }

    // Initialize and load data
    async init() {
        this.showLoading();

        try {
            await this.loadConfig();
            const data = await this.fetchPlantsData();
            this.displayPlants(data);
        } catch (error) {
            this.showError(error.message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const plantsLoader = new HikingPlantsLoader();
    plantsLoader.init();
});