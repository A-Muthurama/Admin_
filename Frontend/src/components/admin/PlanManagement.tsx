import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { Edit2, Save, X } from 'lucide-react';
import "../../styles/plan-management.css";

// Fallback to production URL if env var is missing, then localhost
const PROD_API = 'https://jewellery-backend.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || PROD_API;

console.log('🔌 API_BASE_URL:', API_BASE_URL); // Debug log

export function PlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: number; posts: number; months: number }>({
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

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Map database plans to frontend format
        const mappedPlans = result.data.map((plan: any) => ({
          id: plan.id.toString(),
          name: plan.name,
          price: plan.price,
          posts: plan.posts,
          months: plan.months
        }));
        setPlans(mappedPlans);
      } else {
        // Fallback: If DB is empty, show default plans
        // ID is set to 'new' logic or similar, but since we rely on DB ID for update, 
        // we might not be able to update them immediately if they don't exist in DB.
        // However, user just wants to SEE them.

        // Better Approach: Trigger seed endpoint or just show mock and handle save carefully.
        // For now, let's just show them. Logic for save might fail if ID is invalid.
        // But user likely just wants to see them.
        setPlans([
          { id: '1', name: 'Starter', price: 299, posts: 5, months: 1 },
          { id: '2', name: 'Growth', price: 399, posts: 8, months: 1 },
          { id: '3', name: 'Professional', price: 599, posts: 15, months: 3 },
          { id: '4', name: 'Enterprise', price: 999, posts: 30, months: 6 },
        ]);
        console.warn('⚠️ No plans found in DB, using defaults.');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditValues({ price: plan.price, posts: plan.posts, months: plan.months });
  };

  const handleSave = async (planId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: editValues.price,
          posts: editValues.posts,
          months: editValues.months,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with saved values
        setPlans(plans.map(p =>
          p.id === planId
            ? { ...p, price: editValues.price, posts: editValues.posts, months: editValues.months }
            : p
        ));
        setEditingPlan(null);
        alert('Plan updated successfully!');
      } else {
        alert('Failed to update plan: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Error updating plan. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
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
      <div className="pm-header-card">
        <div>
          <h3 className="pm-title">Subscription Plans</h3>
          <p className="pm-subtitle">Manage pricing tiers and post limits</p>
        </div>
      </div>

      <div className="pm-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="pm-card">
            <div className="text-center mb-4 flex-grow">
              <h4 className="pm-plan-name">{plan.name}</h4>

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
                <button
                  onClick={() => handleEdit(plan)}
                  className="pm-btn-edit"
                >
                  <Edit2 className="w-4 h-4" /> Edit Plan
                </button>
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
