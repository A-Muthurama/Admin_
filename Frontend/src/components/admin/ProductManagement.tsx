import React, { useState, useEffect } from "react";
import {
  Trash2, Pencil, Link2, Sparkles, Loader2, Globe,
  ImagePlus, Package, Send, X, CheckCircle2, AlertTriangle,
  RefreshCw, Camera,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProducts, createProduct, updateProduct, deleteProduct, Product,
} from "../../api/api";

/* ─── Image Drop Zone ─── */
function ImageDropZone({
  id, preview, onFile, label, required,
}: {
  id: string; preview: string | null;
  onFile: (f: File) => void; label: string; required?: boolean;
}) {
  return (
    <div className="img-zone-wrap">
      <input
        type="file"
        accept="image/*"
        id={id}
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
      />
      <label htmlFor={id} className={`img-zone${preview ? " has-img" : ""}`}>
        {preview ? (
          <>
            <img src={preview} alt={label} className="img-zone-preview" />
            <div className="img-zone-change">
              <Camera size={18} />
              <span>Change Photo</span>
            </div>
          </>
        ) : (
          <div className="img-zone-placeholder">
            <div className="img-zone-icon-wrap">
              <ImagePlus size={24} />
            </div>
            <span className="img-zone-label">{label}</span>
            <span className={required ? "img-badge required" : "img-badge optional"}>
              {required ? "Required" : "Optional"}
            </span>
            <span className="img-zone-hint">Click to upload</span>
          </div>
        )}
      </label>
    </div>
  );
}

/* ─── Delete Warning Modal ─── */
function DeleteModal({
  product, onCancel, onConfirm, isDeleting,
}: {
  product: Product; onCancel: () => void; onConfirm: () => void; isDeleting: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={!isDeleting ? onCancel : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon danger-icon"><AlertTriangle size={26} /></div>
        <h3 className="modal-title">Delete Product?</h3>
        <p className="modal-body">
          You're about to permanently remove <strong>"{product.title}"</strong> from
          the admin panel and user app. This <em>cannot</em> be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel} disabled={isDeleting}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting
              ? <><Loader2 size={14} className="spin" /> Deleting…</>
              : <><Trash2 size={14} /> Yes, Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─── */
function EditModal({
  product, onCancel, onSaved,
}: {
  product: Product; onCancel: () => void; onSaved: (p: Product) => void;
}) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description || "");
  const [affiliateUrl, setAffiliateUrl] = useState(product.affiliate_url);
  const [img1File, setImg1File] = useState<File | null>(null);
  const [img2File, setImg2File] = useState<File | null>(null);
  const [img1Preview, setImg1Preview] = useState<string | null>(product.image1_url);
  const [img2Preview, setImg2Preview] = useState<string | null>(product.image2_url || null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!affiliateUrl.trim()) return toast.error("Affiliate URL is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("affiliateUrl", affiliateUrl);

      // Determine which image slot is being modified
      let targetImageIndex = "";
      if (img1File && img2File) {
        targetImageIndex = "both";
        fd.append("images", img1File);
        fd.append("images", img2File);
      } else if (img1File) {
        targetImageIndex = "1";
        fd.append("images", img1File);
      } else if (img2File) {
        targetImageIndex = "2";
        fd.append("images", img2File);
      }
      if (targetImageIndex) {
        fd.append("targetImageIndex", targetImageIndex);
      }

      const res = await updateProduct(product.id, fd);
      toast.success("Product updated!");
      onSaved(res.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={!saving ? onCancel : undefined}>
      <div className="modal-box edit-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <div className="edit-modal-title-row">
            <Pencil size={15} />
            <span style={{ color: "#ffffff" }}>Edit Product</span>
          </div>
          <button className="modal-close-btn" onClick={onCancel} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="edit-modal-body">
          <div className="form-field">
            <label className="field-label">Title <span className="req-dot">*</span></label>
            <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <textarea className="field-input field-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product description" />
          </div>
          <div className="form-field">
            <label className="field-label">Affiliate URL <span className="req-dot">*</span></label>
            <div className="field-icon-wrap">
              <Link2 size={14} className="field-icon" />
              <input className="field-input field-icon-input" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">Images <span className="hint-text">(upload to replace current)</span></label>
            <div className="edit-img-grid">
              <ImageDropZone id="edit-img1" preview={img1Preview} label="Primary Image" required
                onFile={(f) => { setImg1File(f); setImg1Preview(URL.createObjectURL(f)); }} />
              <ImageDropZone id="edit-img2" preview={img2Preview} label="Secondary Image"
                onFile={(f) => { setImg2File(f); setImg2Preview(URL.createObjectURL(f)); }} />
            </div>
          </div>
        </div>

        <div className="edit-modal-footer">
          <button className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="spin" /> Saving…</>
              : <><CheckCircle2 size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main: ProductManagement ─── */
export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setAffiliateUrl("");
    setImage1(null); setImage2(null);
    setImage1Preview(null); setImage2Preview(null);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Product title is required");
    if (!affiliateUrl.trim()) return toast.error("Affiliate URL is required");
    if (!image1) return toast.error("At least one product image is required");

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("affiliateUrl", affiliateUrl);
    fd.append("images", image1);
    if (image2) fd.append("images", image2);

    try {
      const res = await createProduct(fd);
      toast.success("Product published!");
      setProducts((prev) => [res.data, ...prev]);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Publish failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaved = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditTarget(null);
  };

  return (
    <>
      <style>{`
        /* ══ Reset & Base ══ */
        .pm-page *{box-sizing:border-box;}
        .pm-page{max-width:1400px;margin:0 auto;padding:clamp(16px,3vw,32px);}
        .spin{animation:spin .7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* ══ Page Header ══ */
        .pm-header{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:flex-start;margin-bottom:clamp(20px,3vw,32px);}
        .pm-page-title{font-size:clamp(20px,2.5vw,26px);font-weight:700;color:#4c0f2e;margin:0;letter-spacing:-0.4px;}
        .pm-page-sub{font-size:13px;color:#8b7080;margin:4px 0 0;line-height:1.4;}
        .btn-refresh{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:1.5px solid #e4d6dc;background:#fff;color:#4c0f2e;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;white-space:nowrap;}
        .btn-refresh:hover{background:#fdf0f5;border-color:#b8849a;}

        /* ══ Two-column layout ══ */
        .pm-layout{display:grid;grid-template-columns:clamp(320px,38%,460px) 1fr;gap:clamp(16px,2vw,28px);align-items:start;}
        @media(max-width:900px){.pm-layout{grid-template-columns:1fr;}}

        /* ══ Form Card ══ */
        .form-card{background:#fff;border:1.5px solid #eedde5;border-radius:18px;overflow:hidden;box-shadow:0 4px 16px rgba(76,15,46,.07);}
        .form-card-header{display:flex;align-items:center;gap:10px;padding:18px 22px;background:linear-gradient(120deg,#4c0f2e 0%,#7b1a4a 100%);}
        .form-card-icon{width:34px;height:34px;background:rgba(255,255,255,.15);border-radius:9px;display:flex;align-items:center;justify-content:center;}
        .form-card-title{font-size:15px;font-weight:600;color:#fff;margin:0;}
        .form-card-body{padding:clamp(16px,3vw,24px);display:flex;flex-direction:column;gap:18px;}

        /* ══ Form Fields ══ */
        .form-field{display:flex;flex-direction:column;gap:6px;}
        .field-label{font-size:12.5px;font-weight:600;color:#2d1620;letter-spacing:.2px;}
        .req-dot{color:#e53e3e;}
        .hint-text{font-weight:400;color:#a08090;font-size:11.5px;}
        .field-input{width:100%;padding:10px 13px;border:1.5px solid #e6d9df;border-radius:10px;font-size:13.5px;font-family:inherit;color:#1a0f14;background:#fdfbfc;transition:border .2s,box-shadow .2s;outline:none;}
        .field-input:focus{border-color:#4c0f2e;box-shadow:0 0 0 3px rgba(76,15,46,.1);background:#fff;}
        .field-textarea{resize:vertical;min-height:80px;}
        .field-icon-wrap{position:relative;}
        .field-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9b7d8a;pointer-events:none;}
        .field-icon-input{padding-left:34px;}

        /* ══ Image Upload Zones ══ */
        .img-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .img-zone-wrap{}
        .img-zone{display:flex;align-items:center;justify-content:center;height:clamp(150px,18vw,200px);border-radius:14px;border:2px dashed #d9c8d0;background:#fdf7f9;cursor:pointer;overflow:hidden;position:relative;transition:border-color .2s,background .2s;}
        .img-zone:hover{border-color:#4c0f2e;background:#fdf0f5;}
        .img-zone.has-img{border:2px solid #e0d0d8;background:transparent;}
        .img-zone-preview{width:100%;height:100%;object-fit:cover;display:block;}
        .img-zone-change{position:absolute;inset:0;background:rgba(30,0,15,.5);backdrop-filter:blur(2px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff;font-size:12px;font-weight:600;opacity:0;transition:opacity .2s;}
        .img-zone:hover .img-zone-change{opacity:1;}
        .img-zone-placeholder{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:14px;}
        .img-zone-icon-wrap{width:44px;height:44px;border-radius:10px;background:#f0e5eb;display:flex;align-items:center;justify-content:center;color:#4c0f2e;}
        .img-zone-label{font-size:12.5px;font-weight:600;color:#3d0f25;}
        .img-badge{display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;}
        .img-badge.required{color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;}
        .img-badge.optional{color:#5a6375;background:#f1f3f6;border:1px solid #e0e4ec;}
        .img-zone-hint{font-size:11px;color:#a08090;}

        /* ══ Publish Button ══ */
        .btn-publish{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px 20px;border-radius:11px;border:none;background:linear-gradient(120deg,#4c0f2e,#7b1a4a);color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(76,15,46,.28);letter-spacing:.2px;font-family:inherit;}
        .btn-publish:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(76,15,46,.35);}
        .btn-publish:active{transform:translateY(0);}
        .btn-publish:disabled{background:#ccc;box-shadow:none;cursor:not-allowed;}

        /* ══ Product List Card ══ */
        .list-card{background:#fff;border:1.5px solid #eedde5;border-radius:18px;box-shadow:0 4px 16px rgba(76,15,46,.07);overflow:hidden;}
        .list-header{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1.5px solid #f5eaf0;}
        .list-header-left{display:flex;align-items:center;gap:10px;}
        .list-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;color:#92400e;}
        .list-title{font-size:15px;font-weight:600;color:#4c0f2e;}
        .count-pill{font-size:11px;font-weight:700;background:#4c0f2e;color:#fff;padding:3px 10px;border-radius:20px;}
        .list-body{padding:clamp(14px,2vw,20px);}

        /* ══ Empty ══ */
        .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;gap:14px;border:2px dashed #eedde5;border-radius:14px;background:#fdf7f9;text-align:center;padding:32px;}
        .empty-icon{width:60px;height:60px;border-radius:14px;background:#f0e5eb;display:flex;align-items:center;justify-content:center;color:#b8849a;}
        .empty-title{font-size:15px;font-weight:600;color:#1a0f14;margin:0;}
        .empty-sub{font-size:13px;color:#8b7080;margin:0;max-width:240px;line-height:1.5;}

        /* ══ Loading ══ */
        .loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;gap:12px;color:#8b7080;font-size:13.5px;font-weight:500;}

        /* ══ Product Rows ══ */
        .products-scroll{display:flex;flex-direction:column;gap:12px;max-height:640px;overflow-y:auto;padding-right:2px;}
        .products-scroll::-webkit-scrollbar{width:4px;}
        .products-scroll::-webkit-scrollbar-thumb{background:#ddd0d8;border-radius:99px;}

        .product-row{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1.5px solid #eedde5;border-radius:14px;background:#fff;transition:all .2s;}
        .product-row:hover{border-color:#c9a8b8;box-shadow:0 4px 14px rgba(76,15,46,.09);background:#fdf9fb;}
        @media(max-width:600px){
          .product-row{grid-template-columns:1fr;gap:10px;}
          .row-imgs{justify-content:flex-start;}
          .row-actions{justify-content:flex-start;}
        }

        /* Row images */
        .row-imgs{display:flex;gap:6px;flex-shrink:0;}
        .row-img{width:64px;height:64px;border-radius:10px;object-fit:cover;border:1.5px solid #eedde5;}
        .row-img-ph{width:64px;height:64px;border-radius:10px;background:#f5eaf0;border:1.5px dashed #ddd0d8;display:flex;align-items:center;justify-content:center;color:#c9a8b8;flex-shrink:0;}

        /* Row info */
        .row-info{min-width:0;}
        .row-title{font-size:14px;font-weight:600;color:#1a0f14;margin:0 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .row-desc{font-size:12.5px;color:#8b7080;margin:0 0 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .row-link{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:500;color:#92400e;background:#fef3c7;border:1px solid #fde68a;padding:3px 10px;border-radius:6px;text-decoration:none;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background .15s;}
        .row-link:hover{background:#fde68a;}

        /* Row actions */
        .row-actions{display:flex;gap:8px;flex-shrink:0;}
        .btn-edit{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:9px;border:1.5px solid #e0d0d8;background:#fff;color:#4c0f2e;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
        .btn-edit:hover{background:#fdf0f5;border-color:#b8849a;}
        .btn-del{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:9px;border:1.5px solid #fecaca;background:#fff;color:#dc2626;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
        .btn-del:hover{background:#fef2f2;border-color:#f87171;}

        /* ══ Modals ══ */
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.48);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;animation:fade-in .15s ease;}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        .modal-box{background:#fff;border-radius:20px;padding:clamp(24px,4vw,36px);max-width:440px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.22);animation:slide-up .2s ease;text-align:center;}
        @keyframes slide-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .modal-icon{width:58px;height:58px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
        .danger-icon{background:#fee2e2;color:#dc2626;}
        .modal-title{font-size:19px;font-weight:700;color:#1a0f14;margin:0 0 12px;}
        .modal-body{font-size:13.5px;color:#6b5860;line-height:1.65;margin:0 0 26px;}
        .modal-body strong{color:#1a0f14;}
        .modal-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}

        /* Edit modal */
        .edit-modal-box{max-width:580px;padding:0;text-align:left;border-radius:20px;overflow:hidden;}
        .edit-modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;background:linear-gradient(120deg,#4c0f2e,#7b1a4a);}
        .edit-modal-title-row{display:flex;align-items:center;gap:8px;color:#ffffff !important;font-size:16px;font-weight:600;}
        .edit-modal-title-row svg{color:#fde68a !important;}
        .modal-close-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:none;background:rgba(255,255,255,.15);color:#fff;cursor:pointer;transition:background .15s;flex-shrink:0;}
        .modal-close-btn:hover{background:rgba(255,255,255,.25);}
        .edit-modal-body{padding:22px 24px;display:flex;flex-direction:column;gap:16px;max-height:65vh;overflow-y:auto;}
        .edit-img-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .edit-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1.5px solid #f0e5ea;}

        /* ══ Shared Buttons ══ */
        .btn-ghost{padding:9px 20px;border-radius:10px;border:1.5px solid #e0d0d8;background:#fff;color:#4b5563;font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s;}
        .btn-ghost:hover{background:#f9fafb;}
        .btn-ghost:disabled{opacity:.5;cursor:not-allowed;}
        .btn-primary{display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:10px;border:none;background:linear-gradient(120deg,#4c0f2e,#7b1a4a);color:#fff;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .18s;}
        .btn-primary:hover:not(:disabled){box-shadow:0 4px 14px rgba(76,15,46,.3);}
        .btn-primary:disabled{opacity:.6;cursor:not-allowed;}
        .btn-danger{display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:10px;border:none;background:#dc2626;color:#fff;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;}
        .btn-danger:hover:not(:disabled){background:#b91c1c;}
        .btn-danger:disabled{opacity:.6;cursor:not-allowed;}

        /* ══ Responsive tweaks ══ */
        @media(max-width:540px){
          .img-grid{grid-template-columns:1fr 1fr;}
          .img-zone{height:140px;}
          .edit-img-grid{grid-template-columns:1fr 1fr;}
          .modal-box{padding:22px 18px;}
          .row-img,.row-img-ph{width:54px;height:54px;}
        }
        @media(max-width:380px){
          .img-grid{grid-template-columns:1fr;}
          .edit-img-grid{grid-template-columns:1fr;}
          .row-imgs{display:none;}
          .product-row{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="pm-page">
        {/* ── Header ── */}
        <div className="pm-header">
          <div>
            <h2 className="pm-page-title">Product Catalogue</h2>
            <p className="pm-page-sub">Publish and manage affiliate products displayed in the user app.</p>
          </div>
          <button className="btn-refresh" onClick={fetchAll}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div className="pm-layout">

          {/* ── LEFT: Publish Form ── */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon"><Sparkles size={16} color="#d4af37" /></div>
              <h3 className="form-card-title">Publish New Product</h3>
            </div>

            <form className="form-card-body" onSubmit={handlePublish}>
              <div className="form-field">
                <label className="field-label">Product Title <span className="req-dot">*</span></label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. 22K Gold Bangles Set"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Description</label>
                <textarea
                  className="field-input field-textarea"
                  placeholder="Brief product description shown in the app…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Affiliate URL <span className="req-dot">*</span></label>
                <div className="field-icon-wrap">
                  <Link2 size={14} className="field-icon" />
                  <input
                    className="field-input field-icon-input"
                    type="url"
                    placeholder="https://example.com/product"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Product Images&nbsp;
                  <span className="hint-text">— 1 required, 2nd optional</span>
                </label>
                <div className="img-grid">
                  <ImageDropZone
                    id="pub-img1" preview={image1Preview} label="Primary Image" required
                    onFile={(f) => { setImage1(f); setImage1Preview(URL.createObjectURL(f)); }}
                  />
                  <ImageDropZone
                    id="pub-img2" preview={image2Preview} label="Secondary Image"
                    onFile={(f) => { setImage2(f); setImage2Preview(URL.createObjectURL(f)); }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-publish" disabled={isSubmitting}>
                {isSubmitting
                  ? <><Loader2 size={16} className="spin" /> Publishing…</>
                  : <><Send size={15} /> Publish Product</>}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Product List ── */}
          <div className="list-card">
            <div className="list-header">
              <div className="list-header-left">
                <div className="list-icon"><Package size={16} /></div>
                <span className="list-title">Published Products</span>
                <span className="count-pill">{products.length}</span>
              </div>
            </div>

            <div className="list-body">
              {isLoading ? (
                <div className="loading-state">
                  <Loader2 size={32} className="spin" style={{ color: "#4c0f2e" }} />
                  Loading products…
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Package size={28} /></div>
                  <h4 className="empty-title">No products yet</h4>
                  <p className="empty-sub">Publish your first affiliate product using the form on the left.</p>
                </div>
              ) : (
                <div className="products-scroll">
                  {products.map((product) => (
                    <div key={product.id} className="product-row">
                      {/* Thumbnails */}
                      <div className="row-imgs">
                        <img src={product.image1_url} alt={product.title} className="row-img" />
                        {product.image2_url
                          ? <img src={product.image2_url} alt={product.title} className="row-img" />
                          : <div className="row-img-ph"><ImagePlus size={18} /></div>}
                      </div>

                      {/* Info */}
                      <div className="row-info">
                        <p className="row-title" title={product.title}>{product.title}</p>
                        <p className="row-desc">{product.description || "No description"}</p>
                        <a
                          href={product.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="row-link"
                          title={product.affiliate_url}
                        >
                          <Globe size={10} /> {product.affiliate_url}
                        </a>
                      </div>

                      {/* Actions */}
                      <div className="row-actions">
                        <button className="btn-edit" onClick={() => setEditTarget(product)}>
                          <Pencil size={13} /> Edit
                        </button>
                        <button className="btn-del" onClick={() => setDeleteTarget(product)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <EditModal
          product={editTarget}
          onCancel={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
