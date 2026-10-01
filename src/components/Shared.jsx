import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, UploadCloud, X, ImageIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { faqs } from '@/data/content';
import { statusLabels } from '@/context/AppContext';
import { preparePhotos } from '@/lib/photos';

export function FAQList({ items = faqs, className = '' }) {
  return <Accordion type="single" collapsible className={className}>{items.map((item,index) => <AccordionItem key={item.q} value={`faq-${index}`}><AccordionTrigger className="py-6 text-left text-base font-semibold hover:no-underline">{item.q}</AccordionTrigger><AccordionContent className="body-copy max-w-3xl pb-6 text-base">{item.a}</AccordionContent></AccordionItem>)}</Accordion>;
}
export function Counter({ label, helper, value, min = 0, max = 8, onChange, icon: Icon }) {
  return <div className="count-control"><div className="flex items-center gap-3">{Icon && <Icon className="text-muted-foreground" size={22} />}<div><span className="text-sm font-semibold">{label}</span>{helper && <p className="field-help">{helper}</p>}</div></div><div className="flex items-center gap-4"><Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-full" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(value-1)} disabled={value<=min}><Minus size={15} /></Button><span className="min-w-4 text-center text-base font-semibold" aria-live="polite">{value}</span><Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-full" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(value+1)} disabled={value>=max}><Plus size={15} /></Button></div></div>;
}
export function FormField({ id, label, error, helper, className = '', ...props }) {
  return <div className={className}><Label htmlFor={id} className="input-label mb-2 block">{label}</Label><Input id={id} className="h-12 bg-white" aria-invalid={!!error} aria-describedby={error || helper ? `${id}-help` : undefined} {...props} />{(error || helper) && <p id={`${id}-help`} className={`mt-2 ${error ? 'field-error' : 'field-help'}`}>{error || helper}</p>}</div>;
}
export function FieldSelect({ id, label, value, onChange, options, placeholder = 'Please select', disabled = false }) {
  return <div><Label htmlFor={id} className="input-label mb-2 block">{label}</Label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} className="h-12 w-full bg-white"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}
export function StatusBadge({ status, payment = false }) {
  const labels = payment ? { unpaid: 'Unpaid', awaiting_verification: 'Awaiting verification', paid: 'Paid' } : statusLabels;
  return <span className={`status-pill ${['pending','unpaid','awaiting_verification'].includes(status) ? 'status-pending' : ''} ${status === 'cancelled' || status === 'declined' ? 'status-cancelled' : ''}`}>{labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}
export function CheckList({ items }) {
  return <ul className="space-y-4">{items.map(item => <li key={item} className="flex gap-3 text-sm"><span className="mt-0.5 rounded-full bg-secondary p-1 text-primary"><Check size={13} /></span><span>{item}</span></li>)}</ul>;
}
export function PhotoUpload({ photos, onChange, id = 'photos' }) {
  const [loading,setLoading] = useState(false);
  async function handle(event) {
    setLoading(true);
    try { onChange(await preparePhotos(event.target.files)); }
    catch(error) { toast.error(error.message); }
    finally { setLoading(false); event.target.value = ''; }
  }
  return <div><Label htmlFor={id} className="input-label mb-2 block">Photos <span className="font-normal text-muted-foreground">(optional)</span></Label><div className="photo-upload"><UploadCloud className="mx-auto mb-3 text-primary" size={26} /><p className="text-sm font-semibold">{loading ? 'Preparing your photos…' : 'A picture helps us understand your space'}</p><p className="field-help mt-2">Up to 4 photos · JPG, PNG or WebP · 8 MB each</p><Label htmlFor={id} className="mt-4 inline-flex cursor-pointer rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Choose photos</Label><input id={id} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handle} disabled={loading} /></div>{photos.length>0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{photos.map((photo,index) => <div className="relative" key={`${photo.name}-${index}`}><img className="h-24 w-full rounded-lg object-cover" src={photo.data} alt={`Selected attachment: ${photo.name}`} /><Button type="button" className="absolute right-1 top-1 h-6 w-6 rounded-full bg-white text-navy hover:bg-secondary" size="icon" aria-label={`Remove ${photo.name}`} onClick={() => onChange(photos.filter((_,i)=>i!==index))}><X size={12} /></Button><p className="mt-1 truncate text-xs text-muted-foreground">{photo.name}</p></div>)}</div>}</div>;
}
export function EmptyState({ title, description, icon: Icon = ImageIcon, children }) {
  return <div className="py-14 text-center"><div className="icon-square mx-auto mb-5"><Icon size={24} /></div><h3 className="text-xl">{title}</h3><p className="body-copy mx-auto mt-3 max-w-md text-sm">{description}</p>{children && <div className="mt-6">{children}</div>}</div>;
}
export function SuccessState({ eyebrow, title, description, reference, children }) {
  return <div className="container-site py-20"><div className="surface mx-auto max-w-2xl p-8 text-center sm:p-12"><div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary"><CheckCircle2 size={30} /></div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{eyebrow}</p><h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1><p className="body-copy mt-5">{description}</p>{reference && <p className="mt-6 rounded-lg bg-muted p-4 text-sm">Your reference: <strong>{reference}</strong></p>}{children}<p className="field-help mt-7">Preview only. Nothing has been sent to Matelink.</p></div></div>;
}
