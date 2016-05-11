import _ from 'lodash';
import assert from 'assert';
import {
	byFields,
	minByFields,
	maxByFields,
	maxByFieldsStacked,
	discreteTicks,
	groupByFields,
	transformFromCenter,
} from './chart-helpers';

describe('chart-helpers', () => {
	// Testing `formatDate` will require us to mock our time zone. Since the
	// function was taken from d3, I'm going to leave out testing it since the
	// value isn't worth the cost of adding a time mocking library.
	//
	// describe('formatDate', () => {});

	describe('transformFromCenter', () => {
		it('should work', () => {
			assert.equal(transformFromCenter(10, 10, 20, 20, 2), 'translate(-30, -30) scale(2)');
			assert.equal(transformFromCenter(10, 10, 12, 16, 3), 'translate(-26, -38) scale(3)');
		});
	});

	describe('groupByFields', () => {
		it('should work', () => {
			const data = [
				{ a: 'one', b: 20, c: 30, d: 40 },
				{ a: 'two', b: 21, c: 31, d: 41 },
				{ a: 'two', b: 22, c: 32, d: 42 },
			];

			assert.deepEqual(
				groupByFields(data, ['b', 'c', 'd']),
				[
					[20, 21, 22],
					[30, 31, 32],
					[40, 41, 42],
				]
			);
		});

		it('should handle missing and extra data points', () => {
			const data = [
				{ a: 'one', b: 20, c: 30, d: 40 },
				{ a: 'two', b: 21,        d: 41 },
				{ a: 'two', b: 22, c: 32, d: 42, e: 100 },
			];

			assert.deepEqual(
				groupByFields(data, ['b', 'c', 'd']),
				[
					[20 , 21        , 22],
					[30 , undefined , 32],
					[40 , 41        , 42],
				]
			);
		});

		it('should handle non-array fields', () => {
			const data = [
				{ a: 'one', b: 1 },
				{ a: 'two', b: 3 },
				{ a: 'two', b: 10 },
			];

			assert.deepEqual(
				groupByFields(data, 'b'),
				[
					[1, 3, 10],
				]
			);
		});
	});

	describe('maxByFieldsStacked', () => {
		it('should return the max for a collection', () => {
			const data = [
				{ a: 'one', b: 1, c: 3, d: 5},
				{ a: 'two', b: 3, c: 4, d: 7},
				{ a: 'two', b: 10, c: 10, d: 10},
			];

			assert.equal(maxByFieldsStacked(data, ['b', 'c', 'd']), 30);
		});
	});

	describe('discreteTicks', () => {
		it('should work on a myriad of ranges', () => {
			assert.deepEqual(discreteTicks(_.times(100), 1), [0]);
			assert.deepEqual(discreteTicks(_.times(100), 2), [0, 99]);
			assert.deepEqual(discreteTicks(_.times(100), 3), [0, 50, 99]);
			assert.deepEqual(discreteTicks(_.times(100), 4), [0, 33, 66, 99]);
		});

		it('should return the plain array if count is too big', () => {
			assert.deepEqual(discreteTicks([1, 2, 3], 3), [1, 2, 3]);
			assert.deepEqual(discreteTicks([1, 2, 3], 4), [1, 2, 3]);
		});

		it('should handle empty arrays', () => {
			assert.deepEqual(discreteTicks([], 100), []);
		});
	});

	describe('byFields', () => {
		it('should work with a single field', () => {
			const data = [
				{ rev: 1 },
				{ rev: 2 },
				{ rev: 'foo', extra: 2 },
			];

			assert.deepEqual(byFields(data, 'rev'), [1, 2, 'foo'], 'got the wrong value back byFields');
		});

		it('should work with a single field in an array', () => {
			const data = [
				{ rev: 1 },
				{ rev: 2 },
				{ rev: 'foo', extra: 2 },
			];

			assert.deepEqual(byFields(data, ['rev']), [1, 2, 'foo'], 'got the wrong value back byFields');
		});

		it('should work with multiple fields', () => {
			const data = [
				{ rev: 1, imps: 100 },
				{ rev: 2, imps: 200 },
				{ rev: 'foo', extra: 2, imps: 300 },
			];

			assert.deepEqual(
				byFields(data, ['rev', 'imps']),
				[1, 2, 'foo', 100, 200, 300],
				'got the wrong value back byFields'
			);
		});
	});

	describe('minByFields', () => {
		it('should take a single field and return the minimum', () => {
			const data = [
				{ a: 1 },
				{ a: 3 },
				{ a: 10 },
				{ a: 3 },
				{ a: 2 },
				{ a: 1 },
			];

			assert.equal(minByFields(data, 'a'), 1, 'did not get the correct min back');
		});

		it('should take an array of fields and return the minimum', () => {
			const data = [
				{ a: 1, b: 10 },
				{ a: 3 },
				{ a: 10, b: 0 },
				{ a: 3, b: 1 },
				{ a: 2, b: 0 },
				{ a: 1, b: 10 },
			];

			assert.equal(minByFields(data, ['a', 'b']), 0, 'did not get the correct min back');
		});
	});

	describe('maxByFields', () => {
		it('should take a single field and return the maximum', () => {
			const data = [
				{ foo: 1 },
				{ foo: 3 },
				{ foo: 10 },
				{ foo: 3 },
				{ foo: 2000 },
				{ foo: 1 },
			];

			assert.equal(maxByFields(data, 'foo'), 2000, 'did not get the correct max back');
		});

		it('should take a single field in an array and return the maximum', () => {
			const data = [
				{ foo: 1 },
				{ foo: 3 },
				{ foo: 10 },
				{ foo: 3 },
				{ foo: 3000 },
				{ foo: 1 },
			];

			assert.equal(maxByFields(data, ['foo']), 3000, 'did not get the correct max back');
		});

		it('should take an array of fields and return the maximum', () => {
			const data = [
				{ a: 1, b: 10 },
				{ a: 3, b: 20 },
				{ a: 10, b: 0 },
				{ a: 3, b: 1 },
				{ a: 2, b: 0 },
				{ a: 1 },
			];

			assert.equal(maxByFields(data, ['a', 'b']), 20, 'did not get the correct max back');
		});
	});
});

