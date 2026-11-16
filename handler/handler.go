package handler

import "online-store/storage"

type Handler struct {
	storage *storage.Storage
}

func NewHandler(strg *storage.Storage) *Handler {
	return &Handler{
		storage: strg,
	}
}