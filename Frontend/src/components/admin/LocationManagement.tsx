import { useState } from "react";
import { states, citiesByState, pincodesByCity } from "../../data/mockData";
import { Plus, Trash2, MapPin, Map, Navigation } from "lucide-react";
import "../../styles/location-management.css";

export function LocationManagement() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPincode, setNewPincode] = useState("");

  const availableCities = selectedState
    ? citiesByState[selectedState] || []
    : [];
  const availablePincodes = selectedCity
    ? pincodesByCity[selectedCity] || []
    : [];

  return (
    <div className="lm-container">
      {/* States Management */}
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">
            <Map size={24} /> States Management
          </h3>
          <p className="lm-card-desc">Define the operational states for the platform</p>
        </div>

        <div className="lm-content-grid">
          {/* Add State */}
          <div className="lm-form-section">
            <h4 className="lm-section-title">Add New State</h4>
            <div className="lm-input-group">
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="Enter state name"
                className="lm-input"
              />
              <button
                onClick={() => {
                  if (newState.trim()) {
                    alert(`State "${newState}" added successfully!`);
                    setNewState("");
                  }
                }}
                className="lm-btn-add"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Existing States */}
          <div className="lm-form-section">
            <h4 className="lm-section-title">
              Existing States ({states.length})
            </h4>
            <div className="lm-list-container">
              {states.map((state) => (
                <div key={state} className="lm-list-item">
                  <div className="lm-item-name">
                    <MapPin className="lm-item-icon" size={16} />
                    <span>{state}</span>
                  </div>
                  <button className="lm-btn-delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cities Management */}
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">
            <Navigation size={24} /> Cities Management
          </h3>
          <p className="lm-card-desc">Configure cities within selected states</p>
        </div>

        <div className="lm-content-grid">
          {/* Add City */}
          <div className="lm-form-section">
            <h4 className="lm-section-title">Add New City</h4>
            <div className="flex flex-col gap-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="lm-select"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <div className="lm-input-group">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Enter city name"
                  disabled={!selectedState}
                  className="lm-input"
                />
                <button
                  onClick={() => {
                    if (newCity.trim() && selectedState) {
                      alert(`City "${newCity}" added to ${selectedState}!`);
                      setNewCity("");
                    }
                  }}
                  disabled={!selectedState}
                  className="lm-btn-add"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Existing Cities */}
          <div className="lm-form-section">
            <h4 className="lm-section-title">Cities by State</h4>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="lm-select mb-2"
            >
              <option value="">Select State to View Cities</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {selectedState && (
              <div className="lm-list-container">
                {availableCities.length > 0 ? availableCities.map((city) => (
                  <div key={city} className="lm-list-item">
                    <div className="lm-item-name">
                      <MapPin className="lm-item-icon" size={16} />
                      <span>{city}</span>
                    </div>
                    <button className="lm-btn-delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )) : (
                  <div className="lm-empty-state">No cities found for this state.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pincodes Management */}
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">
            <MapPin size={24} /> Pincode Zones
          </h3>
          <p className="lm-card-desc">Granular control for delivery and service areas</p>
        </div>

        <div className="lm-content-grid">
          {/* Add Pincode */}
          <div className="lm-form-section">
            <h4 className="lm-section-title">Add New Pincode</h4>
            <div className="flex flex-col gap-3">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity("");
                }}
                className="lm-select"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className="lm-select disabled:opacity-50"
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <div className="lm-input-group">
                <input
                  type="text"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  placeholder="Enter pincode"
                  disabled={!selectedCity}
                  className="lm-input"
                />
                <button
                  onClick={() => {
                    if (newPincode.trim() && selectedCity) {
                      alert(
                        `Pincode "${newPincode}" added to ${selectedCity}!`
                      );
                      setNewPincode("");
                    }
                  }}
                  disabled={!selectedCity}
                  className="lm-btn-add"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Existing Pincodes */}
          <div className="lm-form-section">
            <h4 className="lm-section-title">Pincodes by City</h4>
            <div className="flex flex-col gap-2 mb-2">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity("");
                }}
                className="lm-select"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className="lm-select disabled:opacity-50"
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {selectedCity && (
              <div className="lm-list-container">
                {availablePincodes.length > 0 ? availablePincodes.map((pincode) => (
                  <div key={pincode} className="lm-list-item">
                    <div className="lm-item-name">
                      <MapPin className="lm-item-icon" size={16} />
                      <span>{pincode}</span>
                    </div>
                    <button className="lm-btn-delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )) : (
                  <div className="lm-empty-state">No pincodes found for this city.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
