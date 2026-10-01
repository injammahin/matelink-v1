import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice, availableAddons, postcodeAvailability, amountLabel } from '../src/lib/pricing.js';
import { initialSettings } from '../src/data/content.js';
import { validateContact } from '../src/lib/validation.js';

const home={service:'move-in',property:'apartment',bedrooms:2,bathrooms:1,addons:{}};
test('missing client rates never produce a fabricated total',()=>{const result=calculatePrice(home,initialSettings);assert.equal(result.ready,false);assert.equal(result.total,null);assert.equal(amountLabel(null),'To be confirmed');});
test('configured rates and per-unit extras calculate accurately',()=>{const settings=structuredClone(initialSettings);settings.serviceRates['move-in']={base:100,bedroom:30,bathroom:20,active:true};settings.propertyAdjustments.apartment=0;settings.addons=settings.addons.map(a=>a.id==='blinds'?{...a,price:5}:a);const result=calculatePrice({...home,addons:{blinds:3,keys:1}},settings);assert.equal(result.ready,true);assert.equal(result.total,235);});
test('unpriced selected extras prevent an incomplete numeric total',()=>{const settings=structuredClone(initialSettings);settings.serviceRates['move-in']={base:0,bedroom:0,bathroom:0};settings.propertyAdjustments.apartment=0;assert.equal(calculatePrice({...home,addons:{carpet:1}},settings).ready,false);});
test('shared extras cannot leak into Deep Cleaning',()=>{assert.equal(availableAddons(initialSettings,'deep').length,0);const settings=structuredClone(initialSettings);settings.serviceRates.deep={base:100,bedroom:0,bathroom:0};settings.propertyAdjustments.apartment=0;const result=calculatePrice({...home,service:'deep',addons:{keys:1}},settings);assert.equal(result.total,100);});
test('postcode coverage is never assumed when the list is missing',()=>{assert.equal(postcodeAvailability('2000',initialSettings),'review');assert.equal(postcodeAvailability('200',initialSettings),'invalid');const settings={...initialSettings,postcodes:['2000']};assert.equal(postcodeAvailability('2000',settings),'available');assert.equal(postcodeAvailability('9999',settings),'unavailable');});
test('contact validation requires usable customer details',()=>{assert.deepEqual(validateContact({name:'Example Customer',email:'customer@example.com',mobile:'0400 000 000'}),{});const errors=validateContact({name:'',email:'invalid',mobile:'12'});assert.ok(errors.name&&errors.email&&errors.mobile);});
