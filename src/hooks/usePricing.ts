import { useState, useEffect } from 'react';
import { priceRules, extraServices } from '../data/mockData';
import { ExtraService } from '../types';

export const usePricing = () => {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const getPrice = (fromLocationId: string, toLocationId: string, vehicleTypeId: string): number => {
    const rule = priceRules.find(
      rule => rule.fromLocationId === fromLocationId && 
              rule.toLocationId === toLocationId && 
              rule.vehicleTypeId === vehicleTypeId
    );
    return rule ? rule.price : 0;
  };

  const getExtraServicesPrice = (): number => {
    return selectedExtras.reduce((total, extraId) => {
      const extra = extraServices.find(e => e.id === extraId);
      return total + (extra ? extra.price : 0);
    }, 0);
  };

  const calculateTotalPrice = (
    fromLocationId: string,
    toLocationId: string,
    vehicleTypeId: string,
    isRoundTrip: boolean = false
  ): number => {
    const basePrice = getPrice(fromLocationId, toLocationId, vehicleTypeId);
    const extrasPrice = getExtraServicesPrice();
    const tripMultiplier = isRoundTrip ? 2 : 1;
    
    return (basePrice * tripMultiplier) + extrasPrice;
  };

  const toggleExtraService = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const getSelectedExtras = (): ExtraService[] => {
    return extraServices.filter(extra => selectedExtras.includes(extra.id));
  };

  return {
    getPrice,
    calculateTotalPrice,
    toggleExtraService,
    selectedExtras,
    getSelectedExtras,
    getExtraServicesPrice
  };
};