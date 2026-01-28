import { useState } from 'react';
import { subscriptionPlans } from '../../data/mockData';
import { SubscriptionPlan } from '../../types';
import { Edit2, Save, X, Bookmark } from 'lucide-react';
import "../../styles/plan-management.css";

export function PlanManagement() {
  const [plans, setPlans] = useState(subscriptionPlans);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: number; posts: number; months: number }>({
    price: 0,
    posts: 0,
    months: 1
  });

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditValues({ price: plan.price, posts: plan.posts, months: plan.months });
  };

  const handleSave = (planId: string) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, price: editValues.price, posts: editValues.posts, months: editValues.months }
        : p
    ));
    setEditingPlan(null);
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

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
