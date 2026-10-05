import {
  Home,
  Sparkles,
  Truck,
  KeyRound,
} from 'lucide-react';

export const SERVICES = [
  {
    id: 'general',
    slug: 'general-cleaning',
    name: 'General Cleaning',
    shortDescription: 'Routine cleaning for a tidy, comfortable home',
    bookingDescription: 'Ideal for regular upkeep and everyday cleaning.',
    icon: Home,
    image: '/images/services/general-cleaning.jpg',
  },
  {
    id: 'deep',
    slug: 'deep-cleaning',
    name: 'Deep Cleaning',
    shortDescription: 'Refreshing your current home',
    bookingDescription: 'Perfect for a thorough top-to-bottom refresh.',
    icon: Sparkles,
    image: '/images/services/deep-cleaning.jpg',
  },
  {
    id: 'move-in',
    slug: 'move-in-cleaning',
    name: 'Move-In Cleaning',
    shortDescription: 'Preparing your next home',
    bookingDescription: 'Get your new home fresh and ready before moving in.',
    icon: Truck,
    image: '/images/services/move-in-cleaning.jpg',
  },
  {
    id: 'end-of-lease',
    slug: 'end-of-lease-cleaning',
    name: 'End-of-Lease Cleaning',
    shortDescription: 'Preparing for a rental handover',
    bookingDescription: 'Designed for tenants preparing to hand back a property.',
    icon: KeyRound,
    image: '/images/services/end-of-lease-cleaning.jpg',
  },
];