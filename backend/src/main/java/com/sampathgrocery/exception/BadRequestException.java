package com.sampathgrocery.exception;

/**
 * Exception thrown for bad request or invalid input
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
