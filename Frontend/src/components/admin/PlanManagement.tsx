import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import "../../styles/plan-management.css";

// Fallback to production URL if env var is missing, then localhost
const PROD_API = 'https://jewellery-backend.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

console.log(' API_BASE_URL:', API_BASE_URL); // Debug log

export function PlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; price: number; posts: number; months: number }>({
    name: '',
    price: 0,
    posts: 0,
    months: 1
  });


  // Fetch plans from database on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/plans`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        if (result.data.length === 0) {
          console.log('ℹ️ No plans found in database.');
          setPlans([]);
        } else {
          // Map database plans to frontend format
          const mappedPlans = result.data.map((plan: any) => ({
            id: plan.id.toString(),
            name: plan.name,
            price: plan.price,
            posts: plan.posts,
            months: plan.months
          }));
          setPlans(mappedPlans);
        }
      } else {
        console.error('❌ Failed to fetch plans:', result.message);
        setPlans([]);
      }
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      // Don't use defaults on error, show what we have (likely empty)
      // unless we want to keep existing plans if this was a refresh
      alert('Could not fetch plans from server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    console.log('✏️ Editing plan:', plan);
    setEditingPlan(plan.id);
    setEditValues({ name: plan.name, price: plan.price, posts: plan.posts, months: plan.months });
  };

  const handleSave = async (planId: string) => {
    console.log('💾 Saving plan:', planId);
    console.log('📝 Edit values:', editValues);
    const isNewPlan = planId.startsWith('new-');
    console.log('🆕 Is new plan?', isNewPlan);

    try {
      let response;
      if (isNewPlan) {
        // CREATE (POST)
        console.log('📤 Sending POST request to create plan...');
        response = await fetch(`${API_BASE_URL}/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editValues.name,
            price: editValues.price,
            posts: editValues.posts,
            months: editValues.months,
          }),
        });
      } else {
        // UPDATE (PATCH)
        console.log(`📤 Sending PATCH request to update plan ${planId}...`);
        response = await fetch(`${API_BASE_URL}/plans/${planId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editValues.name,
            price: editValues.price,
            posts: editValues.posts,
            months: editValues.months,
          }),
        });
      }

      const result = await response.json();
      console.log('📡 API Response:', result);

      if (result.success) {
        // Refresh plans from server to get correct IDs and updated timestamps
        console.log('✅ Plan saved successfully, refreshing list...');
        await fetchPlans();
        setEditingPlan(null);
        alert(isNewPlan ? 'Plan created successfully!' : 'Plan updated successfully!');
      } else {
        console.error('❌ Server error detail:', result.error || result.message);
        alert('Failed to save plan: ' + (result.message || result.error || 'Check console for details'));

        // Don't update local state here if server call failed, 
        // because fetchPlans hasn't been called and we want the user to stay in edit mode
        // but we should probably keep the values they typed.
      }

    } catch (error) {
      console.error('❌ Error saving plan:', error);
      // Update UI anyway so user isn't stuck
      setPlans(plans.map(p =>
        p.id === planId
          ? { ...p, name: editValues.name, price: editValues.price, posts: editValues.posts, months: editValues.months }
          : p
      ));
      setEditingPlan(null);
      alert('Error connecting to server. Plan changes applied locally but might not be saved.');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    if (planId.startsWith('new-')) {
      setPlans(plans.filter(p => p.id !== planId));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/plans/${planId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setPlans(plans.filter(p => p.id !== planId));
        alert('Plan deleted successfully');
      } else {
        console.error('❌ Server delete error:', result);
        alert('Failed to delete plan: ' + (result.message || result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error deleting plan:', error);
      // Force remove from UI if server unreachable
      setPlans(plans.filter(p => p.id !== planId));
      alert('Error connecting to server. Plan removed locally.');
    }
  }

  const handleCancel = () => {
    console.log('❌ Cancelling edit for plan:', editingPlan);
    // If cancelling a new plan that hasn't been saved, remove it
    if (editingPlan && editingPlan.startsWith('new-')) {
      console.log('🗑️ Removing unsaved new plan');
      setPlans(plans.filter(p => p.id !== editingPlan));
    }
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    console.log('➕ Add Plan button clicked');
    console.log('📊 Current plans count:', plans.length);

    const timestamp = Date.now();
    const newId = `new-${timestamp}`;
    const newPlan = {
      id: newId,
      name: 'New Plan',
      price: 99,
      posts: 1,
      months: 1
    };

    console.log('🆕 Creating new plan:', newPlan);
    setPlans([...plans, newPlan]);
    console.log('📋 Plans after adding:', [...plans, newPlan].length);

    handleEdit(newPlan); // Immediately enter edit mode
    console.log('✏️ Entering edit mode for new plan');
  };

  if (loading) {
    return (
      <div className="pm-container">
        <div className="pm-header-card">
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-container">
      <div className="pm-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="pm-title">Subscription Plans</h3>
          <p className="pm-subtitle">Manage pricing tiers and post limits</p>
        </div>
        <button onClick={handleAddPlan} className="pm-btn-add">
          <Plus size={16} /> Add Plan
        </button>
      </div>

      <div className="pm-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="pm-card">
            <div className="text-center mb-4 flex-grow">
              {editingPlan === plan.id ? (
                // Edit Name in Edit Mode
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="pm-plan-name-input"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    width: '100%',
                    padding: '4px'
                  }}
                />
              ) : (
                <h4 className="pm-plan-name">{plan.name}</h4>
              )}

              {editingPlan === plan.id ? (
                <div className="pm-edit-form">
                  <div className="pm-input-group">
                    <label className="pm-label">Price (₹)</label>
                    <input
                      type="number"
                      value={editValues.price}
                      onChange={(e) => setEditValues({ ...editValues, price: parseInt(e.target.value) || 0 })}
                      className="pm-input"
                    />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Posts</label>
                    <input
                      type="number"
                      value={editValues.posts}
                      onChange={(e) => setEditValues({ ...editValues, posts: parseInt(e.target.value) || 0 })}
                      className="pm-input"
                    />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Months</label>
                    <input
                      type="number"
                      value={editValues.months}
                      onChange={(e) => setEditValues({ ...editValues, months: parseInt(e.target.value) || 1 })}
                      className="pm-input"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="pm-price-display">
                    <span className="pm-price-val">₹{plan.price}</span>
                  </div>
                  <div className="pm-stats-grid">
                    <div className="pm-stat-box">
                      <p className="pm-stat-num">{plan.posts}</p>
                      <p className="pm-stat-label">Posts</p>
                    </div>
                    <div className="pm-stat-box">
                      <p className="pm-stat-num">{plan.months}</p>
                      <p className="pm-stat-label">Month{plan.months > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-auto">
              {editingPlan === plan.id ? (
                <div className="pm-action-row">
                  <button
                    onClick={() => handleSave(plan.id)}
                    className="pm-btn-save"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="pm-btn-cancel"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="pm-btn-edit"
                    style={{ flex: 1 }}
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="pm-btn-cancel"
                    style={{ color: '#ef4444', flex: '0 0 auto', width: '40px', padding: '0' }}
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Plan Features */}
      <div className="pm-features-card">
        <h4 className="pm-features-title">Plan Feature Details</h4>
        <div className="pm-feat-grid">
          <div>
            <p className="pm-feat-subtitle">Universal Includes</p>
            <ul className="pm-list">
              <li>Admin approval for all offers</li>
              <li>Analytics dashboard access</li>
              <li>Edit and delete offer capabilities</li>
              <li>Google Maps integration</li>
            </ul>
          </div>
          <div>
            <p className="pm-feat-subtitle">Usage Rules</p>
            <ul className="pm-list">
              <li>Posts reduce when offers are published</li>
              <li>Expired offers don't refund posts</li>
              <li>Vendors can purchase new plans anytime</li>
              <li>Posts from multiple plans accumulate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
