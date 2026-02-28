package com.sampathgrocery.entity.delivery;

/**
 * Delivery Status Enum with allowed transitions
 */
public enum DeliveryStatus {
    PENDING,
    ASSIGNED,
    PICKED_UP,
    IN_TRANSIT,
    DELIVERED,
    FAILED,
    CANCELLED;

    /**
     * Check if transition from current status to new status is allowed
     */
    public boolean canTransitionTo(DeliveryStatus newStatus) {
        if (this == newStatus) {
            return false; // No transition to same status
        }

        switch (this) {
            case PENDING:
                return newStatus == ASSIGNED || newStatus == CANCELLED;
            case ASSIGNED:
                return newStatus == PICKED_UP || newStatus == CANCELLED;
            case PICKED_UP:
                return newStatus == IN_TRANSIT || newStatus == FAILED;
            case IN_TRANSIT:
                return newStatus == DELIVERED || newStatus == FAILED;
            case DELIVERED:
            case FAILED:
            case CANCELLED:
                return false; // Final states
            default:
                return false;
        }
    }
}
