const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

// Initialize the WebSocket connection
const room = new WebsimSocket();

const App = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [sodaName, setSodaName] = useState('');
  const [flavor, setFlavor] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sodaDescription, setSodaDescription] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [sodas, setSodas] = useState([]);
  
  // Use React's external store hooks to keep the UI in sync with persisted data
  const sodaList = React.useSyncExternalStore(
    room.collection('soda').subscribe,
    () => room.collection('soda').getList()
  );

  // Sort sodas by creation date (newest first)
  useEffect(() => {
    if (sodaList) {
      const sortedSodas = [...sodaList].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setSodas(sortedSodas);
    }
  }, [sodaList]);

  const generateSoda = async () => {
    if (!sodaName || !flavor || !occasion) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // First, generate soda description using LLM
      const sodaPrompt = `Create a detailed and creative description for a fictional soda called "${sodaName}" with ${flavor} flavor that would be perfect for ${occasion}. Include details about its taste profile, appearance, bubbliness, and any unique characteristics. Keep it between 100-150 words.`;
      
      const descriptionCompletion = await websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a creative beverage copywriter who specializes in crafting enticing and imaginative soda descriptions."
          },
          {
            role: "user",
            content: sodaPrompt
          }
        ]
      });
      
      const description = descriptionCompletion.content;
      setSodaDescription(description);
      
      // Then, generate the image based on the description
      const imagePrompt = `A professional product photography of a soda can or bottle for "${sodaName}", a ${flavor} flavored soda perfect for ${occasion}. ${description.substring(0, 300)}`;
      
      const imageResult = await websim.imageGen({
        prompt: imagePrompt,
        aspect_ratio: "1:1"
      });
      
      setGeneratedImage(imageResult.url);
      
      // Save to database
      await room.collection('soda').create({
        name: sodaName,
        flavor: flavor,
        occasion: occasion,
        description: description,
        image_url: imageResult.url
      });
      
      // Reset form
      setSodaName('');
      setFlavor('');
      setOccasion('');
      setActiveTab('gallery');
      
    } catch (err) {
      console.error('Error generating soda:', err);
      setError('Failed to generate soda. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">This Soda Does Not Exist</h1>
        <p className="app-description">
          Generate fictional soda brands with AI - create unique flavors that don't exist in real life!
        </p>
      </header>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`} 
          onClick={() => setActiveTab('create')}
        >
          Create Soda
        </button>
        <button 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`} 
          onClick={() => setActiveTab('gallery')}
        >
          Soda Gallery
        </button>
      </div>
      
      {activeTab === 'create' && (
        <div className="form-container">
          <div className="input-group">
            <label htmlFor="soda-name">Soda Name</label>
            <input
              id="soda-name"
              type="text"
              value={sodaName}
              onChange={(e) => setSodaName(e.target.value)}
              placeholder="e.g. NeonBlast, MoonFizz, etc."
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="flavor">Flavor Description</label>
            <input
              id="flavor"
              type="text"
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              placeholder="e.g. tangy cherry-lime, exotic dragon fruit, etc."
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="occasion">Perfect Occasion</label>
            <input
              id="occasion"
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. summer parties, late night coding, etc."
              disabled={loading}
            />
          </div>
          
          <button onClick={generateSoda} disabled={loading || !sodaName || !flavor || !occasion}>
            {loading ? 'Generating...' : 'Generate Soda'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
          
          {loading && <div className="loading-spinner"></div>}
          
          {generatedImage && (
            <div className="soda-preview">
              <h3>Preview:</h3>
              <div className="soda-card">
                <img src={generatedImage} alt={sodaName} className="soda-image" />
                <div className="soda-content">
                  <h3 className="soda-name">{sodaName}</h3>
                  <p className="soda-description">{sodaDescription}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'gallery' && (
        <div className="gallery-container">
          <h2>Community Generated Sodas</h2>
          
          {sodas.length === 0 ? (
            <p>No sodas have been created yet. Be the first to make one!</p>
          ) : (
            <div className="gallery">
              {sodas.map((soda) => (
                <div key={soda.id} className="soda-card">
                  <img src={soda.image_url} alt={soda.name} className="soda-image" />
                  <div className="soda-content">
                    <h3 className="soda-name">{soda.name}</h3>
                    <p className="soda-description">{soda.description}</p>
                    <div className="soda-meta">
                      <span>Flavor: {soda.flavor}</span>
                      <span>Occasion: {soda.occasion}</span>
                    </div>
                    <div className="soda-creator">
                      <img 
                        src={`https://images.websim.ai/avatar/${soda.username}`} 
                        alt={soda.username}
                        className="creator-avatar"
                      />
                      <span>Created by {soda.username}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// When DOM is ready, render the app
const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />);

