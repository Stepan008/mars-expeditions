export default class NasaService { 
    _apiBase = 'https://api.nasa.gov/mars-photos/api/v1';
    getResource = async (rover) => {
        const res = await fetch(`${this._apiBase}/manifests/${rover}?api_key=DEMO_KEY`);
        return await res.json();
    };
    
    getPhotos = async (rover, sol, page, camera) => {
        const res = await fetch(`${this._apiBase}/rovers/${rover}/photos?sol=${sol}&page=${page}&camera=${camera}&api_key=DEMO_KEY`);
        return await res.json();
    }
}