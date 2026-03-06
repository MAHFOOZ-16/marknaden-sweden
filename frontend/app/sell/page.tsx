'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

const STEPS = ['Details', 'Media', 'Pricing', 'Review'];
const CONDITIONS = [
    { value: 'new', label: 'New', emoji: '✨' },
    { value: 'like_new', label: 'Like New', emoji: '🌟' },
    { value: 'good', label: 'Good', emoji: '👍' },
    { value: 'fair', label: 'Fair', emoji: '👌' },
    { value: 'poor', label: 'Poor', emoji: '🔧' },
];

export default function SellPage() {
    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category_id: '',
        condition: 'good',
        price: '',
        currency: 'SEK',
        location_city: '',
        shipping_available: false,
        shipping_cost: '',
    });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    const updateForm = (key: string, value: string | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Filter valid browser-renderable image types to avoid broken HEIC previews on Mac
        const validFiles = Array.from(files).filter(f =>
            f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp' || f.type === 'image/gif'
        );

        if (validFiles.length < files.length) {
            alert("Some files were skipped. Please upload standard web images (JPG, PNG, WEBP). HEIC formats from iPhone need to be converted to JPG first.");
        }

        const newImages = await Promise.all(
            validFiles.map(file => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.readAsDataURL(file);
            }))
        );

        setImages(prev => [...prev, ...newImages].slice(0, 6));
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Validation logic per step
    const isStepValid = () => {
        if (step === 0) {
            return form.title.trim() !== '' && form.category_id !== '' && form.description.trim().length >= 10;
        }
        if (step === 1) {
            return images.length > 0;
        }
        if (step === 2) {
            return form.price !== '' && form.location_city.trim() !== '' && (!form.shipping_available || form.shipping_cost !== '');
        }
        return true; // Step 3 (Review)
    };

    const handleSubmit = async () => {
        setIsPublishing(true);
        try {
            await api.createListing({
                ...form,
                price: Number(form.price),
                shipping_cost: form.shipping_cost ? Number(form.shipping_cost) : undefined,
                media_urls: images.length > 0 ? images : undefined,
            } as any);
            setSubmitted(true);
        } catch (error: any) {
            console.error("Listing Error:", error);
            const errString = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);

            if (errString.includes("413") || errString.toLowerCase().includes("too large")) {
                alert(`Upload failed: The image sizes are too large. Try uploading fewer or smaller images.`);
            } else {
                alert(`Failed to create listing. Please ensure all required fields are filled.\nError details: ${errString}`);
            }
            setSubmitted(false);
        } finally {
            setIsPublishing(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="text-7xl mb-6">🎉</div>
                <h1 className="text-3xl font-bold text-white mb-3">Listed Successfully!</h1>
                <p className="text-[#6a6a82] mb-8">Your item is now live on Marknaden</p>
                <div className="flex gap-3 justify-center">
                    <a href="/listings" className="btn-primary">View Listings</a>
                    <button onClick={() => { setSubmitted(false); setStep(0); setImages([]); setForm({ title: '', description: '', category_id: '', condition: 'good', price: '', currency: 'SEK', location_city: '', shipping_available: false, shipping_cost: '' }); }} className="btn-secondary">
                        List Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sell an Item</h1>
            <p className="text-[#6a6a82] mb-8">List your item in under 60 seconds</p>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-10">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex-1 flex items-center gap-2">
                        <button
                            onClick={() => setStep(i)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${i <= step ? 'bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white' : 'bg-white/[0.05] text-[#6a6a82]'
                                }`}
                        >
                            {i < step ? '✓' : i + 1}
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-[#6c5ce7]' : 'bg-white/[0.06]'}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="glass-card p-6 sm:p-8 hover:!transform-none animate-fade-in" key={step}>
                {/* Step 0: Details */}
                {step === 0 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-semibold text-white mb-4">What are you selling?</h2>
                        <div>
                            <label className="text-sm font-medium text-[#9898b0] block mb-2">Title <span className="text-red-500 font-bold">*</span></label>
                            <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="e.g. iPhone 15 Pro 256GB" className="input-field" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#9898b0] block mb-2">Category <span className="text-red-500 font-bold">*</span></label>
                            <select value={form.category_id} onChange={e => updateForm('category_id', e.target.value)} className="input-field">
                                <option value="">Select a category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#9898b0] block mb-2">Condition <span className="text-red-500 font-bold">*</span></label>
                            <div className="grid grid-cols-5 gap-2">
                                {CONDITIONS.map(c => (
                                    <button key={c.value} onClick={() => updateForm('condition', c.value)}
                                        className={`p-3 rounded-xl text-center transition-all border ${form.condition === c.value ? 'border-[#6c5ce7] bg-[#6c5ce7]/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}
                                    >
                                        <div className="text-xl mb-1">{c.emoji}</div>
                                        <div className="text-xs text-[#9898b0]">{c.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#9898b0] flex items-center justify-between mb-2">
                                <span>Description <span className="text-red-500 font-bold">*</span></span>
                                <span className={`text-[10px] uppercase tracking-wider ${form.description.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                                    {form.description.length < 10 ? `Min 10 characters (${form.description.length})` : 'Perfect!'}
                                </span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={e => updateForm('description', e.target.value)}
                                placeholder="Describe your item in detail (minimum 10 characters)..."
                                className={`input-field min-h-[120px] resize-y transition-all ${form.description.length > 0 && form.description.length < 10 ? 'border-red-500/50 bg-red-500/5' : ''}`}
                            />
                        </div>
                    </div>
                )}

                {/* Step 1: Media */}
                {step === 1 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-semibold text-white mb-4">Add Photos</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <label key={i} className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer hover:border-[#6c5ce7] relative overflow-hidden ${i === 0 ? 'border-[#6c5ce7]/40 bg-[#6c5ce7]/5' : 'border-white/[0.1] bg-white/[0.02]'}`}>
                                    {images[i] ? (
                                        <div className="relative w-full h-full group">
                                            <img src={images[i]} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                            {/* Remove Image Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRemoveImage(i);
                                                }}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                title="Remove image"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-sm pointer-events-none">
                                                Added
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6a6a82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            <span className="text-xs text-[#6a6a82]">{i === 0 ? 'Main photo' : 'Add photo'}</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/jpeg, image/png, image/webp" multiple onChange={handleImageUpload} className="hidden" />
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-[#6a6a82]">📷 Upload up to 6 photos. We support JPG, PNG, and WEBP formats.</p>
                    </div>
                )}

                {/* Step 2: Pricing */}
                {step === 2 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-semibold text-white mb-4">Set Your Price</h2>
                        <div>
                            <label className="text-sm font-medium text-[#9898b0] block mb-2">Price (SEK) <span className="text-red-500 font-bold">*</span></label>
                            <div className="relative">
                                <input type="number" min="0" value={form.price} onChange={e => updateForm('price', e.target.value)} placeholder="0" className="input-field text-2xl font-bold !pr-16" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a6a82] font-medium">SEK</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#9898b0] block mb-2">Location <span className="text-red-500 font-bold">*</span></label>
                            <input type="text" value={form.location_city} onChange={e => updateForm('location_city', e.target.value)} placeholder="e.g. Stockholm" className="input-field" />
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <input type="checkbox" id="shipping" checked={form.shipping_available} onChange={e => updateForm('shipping_available', e.target.checked)} className="w-5 h-5 rounded accent-[#6c5ce7]" />
                            <label htmlFor="shipping" className="text-sm text-[#9898b0] cursor-pointer">I can ship this item</label>
                        </div>
                        {form.shipping_available && (
                            <div className="animate-fade-in">
                                <label className="text-sm font-medium text-[#9898b0] block mb-2">Shipping Cost (SEK)</label>
                                <input type="number" min="0" value={form.shipping_cost} onChange={e => updateForm('shipping_cost', e.target.value)} placeholder="0 for free shipping" className="input-field" />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-semibold text-white mb-4">Review Your Listing</h2>

                        {/* Display an image overview preview */}
                        {images.length > 0 && (
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <img key={idx} src={img} alt="Attached" className="w-20 h-20 object-cover rounded-lg border border-white/10 shrink-0" />
                                ))}
                            </div>
                        )}

                        <div className="space-y-3">
                            {[
                                { label: 'Title', value: form.title || '—' },
                                { label: 'Condition', value: CONDITIONS.find(c => c.value === form.condition)?.label || form.condition },
                                { label: 'Price', value: form.price ? `${Number(form.price).toLocaleString()} SEK` : '—' },
                                { label: 'Location', value: form.location_city || '—' },
                                { label: 'Shipping', value: form.shipping_available ? (form.shipping_cost ? `${form.shipping_cost} SEK` : 'Free') : 'No' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                                    <span className="text-sm text-[#6a6a82]">{item.label}</span>
                                    <span className="text-sm text-white font-medium">{item.value}</span>
                                </div>
                            ))}
                            {form.description && (
                                <div className="pt-3">
                                    <span className="text-sm text-[#6a6a82] block mb-1">Description</span>
                                    <p className="text-sm text-[#d0d0e0] leading-relaxed whitespace-pre-wrap">{form.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
                    <button onClick={() => setStep(Math.max(0, step - 1))} className="btn-secondary" disabled={step === 0} style={{ opacity: step === 0 ? 0.3 : 1 }}>
                        ← Back
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!isStepValid()}
                            className={`btn-primary transition-opacity ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Continue →
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isPublishing} className={`btn-primary !bg-gradient-to-r !from-[#00d2a0] !to-[#00b894] ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isPublishing ? '🚀 Publishing...' : '🚀 Publish Listing'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
