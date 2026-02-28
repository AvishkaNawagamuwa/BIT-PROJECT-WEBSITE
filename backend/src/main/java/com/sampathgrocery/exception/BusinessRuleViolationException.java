package com.sampathgrocery.exception;

/**
 * Exception thrown when business rules are violated
 */
public class BusinessRuleViolationException extends RuntimeException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
