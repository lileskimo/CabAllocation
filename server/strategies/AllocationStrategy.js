class AllocationStrategy {
  constructor() {
    if (this.constructor === AllocationStrategy) {
      throw new Error('AllocationStrategy is an abstract class and cannot be instantiated directly');
    }
  }

  // Abstract method that must be implemented by subclasses
  assignCab(trip, cabs) {
    throw new Error('assignCab method must be implemented by subclass');
  }
}

module.exports = AllocationStrategy;
