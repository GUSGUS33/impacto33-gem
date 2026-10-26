import { expect, it } from 'vitest';
import { sameFamilyRelated } from './relatedProductFamily';
const attrs = (value: string) => ({ nodes: [{ slug: value }] });
it('only admits verified same-family alternatives', () => {
  expect(sameFamilyRelated({id:'1', productCategories:attrs('cam'), related:{nodes:[{id:'2',productCategories:attrs('cam_w')},{id:'3',productCategories:attrs('bags')},{id:'4'}]}}).map(x=>x.id)).toEqual(['2']);
  expect(sameFamilyRelated({related:{nodes:[{id:'2',productCategories:attrs('cam')}]}})).toEqual([]);
});
