package com.sampathgrocery.exception;

/**
 * Exception thrown when an invalid delivery status transition is attempted
 */
public class InvalidStatusTransitionException extends RuntimeException {
    
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
