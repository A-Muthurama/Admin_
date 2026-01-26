import { useState } from 'react';
import { subscriptionPlans } from '../../data/mockData';
import { SubscriptionPlan } from '../../types';
import { Edit2, Save, X } from 'lucide-react';

export function PlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(subscriptionPlans);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);


    const [editValues, setEditValues] = useState<{
    price: number;
    posts: number;
    months: number;
    feature1: string;
    feature2: string;
    feature3: string;
    }>({
      price: 0,
      posts: 0,
      months: 1,
      feature1: '',
      feature2: '',
      feature3: '',
    });


  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditValues({
      price: plan.price,
      posts: plan.posts,
      months: plan.months,
      feature1: `${plan.posts} Product Posts`,
      feature2: 'Admin Approval',
      feature3: 'Visible to Customers',
    });
  };

  const handleSave = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              price: editValues.price,
              posts: editValues.posts,
              months: editValues.months,
            }
          : p
      )
    );
    setEditingPlan(null);
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-gray-900 text-lg font-semibold">
        Subscription Plans Management
      </h3>
      <p className="text-gray-600 mb-6">
        Modify pricing and plan content
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl p-6 pb-10 bg-white shadow-lg border border-gray-200 text-center overflow-visible"
          >
            {/* PRICE */}
                  {editingPlan === plan.id ? (
                    <input
                      type="number"
                      value={editValues.price}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          price: Number(e.target.value) || 0,
                        })
                      }
                       className="w-full text-4xl font-extrabold text-center border rounded-xl py-3"
                        />
                    ) : (
                        <>
                          {/* PRICE HEADER — FIXED */}
                          <div className="text-center">
                            <div className="block text-[52px] font-extrabold leading-[1.1] text-gray-900">
                              ₹{plan.price}
                            </div>

                            <div className="block mt-2 mb-6 text-[14px] text-gray-500">
                              {plan.posts} Product Posts
                            </div>
                          </div>

                          {/* SPACING BETWEEN PRICE & FEATURES */}
                          <div className="mt-10" />
                        </>
                      )}

            
            {/* FEATURES */}
            <div
              className={`space-y-3 text-[14px] text-gray-700 ${
                editingPlan === plan.id ? 'mt-8' : ''
              }`}
            >

              {editingPlan === plan.id ? (
                <>
                  <input
                    value={editValues.feature1}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        feature1: e.target.value,
                      })
                    }
                    className="w-full text-center border rounded-lg py-2"
                  />
                  <input
                    value={editValues.feature2}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        feature2: e.target.value,
                      })
                    }
                    className="w-full text-center border rounded-lg py-2"
                  />
                  <input
                    value={editValues.feature3}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        feature3: e.target.value,
                      })
                    }
                    className="w-full text-center border rounded-lg py-2"
                  />
                  <input
                    type="number"
                    value={editValues.months}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        months: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full text-center border rounded-lg py-2"
                  />
                </>
              ) : (
                <>
                  <p>✔ Admin Approval</p>
                  <p>✔ Visible to Customers</p>
                  <p>✔ {plan.months} Month Access</p>
                </>
              )}
            </div>

            {/* ACTION BUTTONS */}
            {editingPlan === plan.id ? (
              <div className="mt-8 flex gap-3">
                  <button
                      onClick={() => handleSave(plan.id)}
                      style={{
                        backgroundColor: '#6B0F3A',
                        color: '#ffffff',
                      }}
                      className="flex-1 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 hover:opacity-90"
                    >
                      <Save size={16} color="white" />
                      Save
                    </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      backgroundColor: '#6c6666',
                      color: '#fbf1f1',
                    }}
                    className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-100"
                  >
                    <X size={16} />
                    Cancel
                  </button>
              </div>
            ) : (
             <button
                onClick={() => handleEdit(plan)}
                style={{
                  backgroundColor: '#6B0F3A',
                  color: '#ffffff',
                }}
                className="w-full mt-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition"
              >
                <Edit2 size={16} color="white" />
                Edit Plan
              </button>
            )}
          </div>
        ))}
      </div>

      {/* INFO SECTION */}
      <div className="mt-8 p-6 rounded-xl bg-blue-50">
        <h4 className="text-gray-900 font-medium">Plan Notes</h4>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>• Admin controls pricing and content</li>
          <li>• Vendors see updated plans instantly</li>
          <li>• Posts are deducted when offers go live</li>
        </ul>
      </div>
    </div>
  );
}
