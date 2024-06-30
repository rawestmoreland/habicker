# Use the official Go image to create a build artifact.
# This is based on Debian and sets the GOPATH environment variable at /go.
FROM golang:1.22 as builder

# Create and change to the app directory.
WORKDIR /app

# Retrieve application dependencies using go mod.
# This allows the container build to be cached.
COPY go.* ./
RUN go mod download

# Copy local code to the container image.
COPY . ./

# Build the binary.
# -o /out/main specifies the output path for the binary.
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /out/main .

# Use a Docker multi-stage build to create a lean production image.
# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM alpine:latest
RUN apk add --no-cache ca-certificates

# Copy the binary to the production image from the builder stage.
COPY --from=builder /out/main /app/main

# Copy static files or other assets you need for your application
# Uncomment and adjust the following line if you have such files.
# COPY pb_public /app/pb_public

# Run the web service on container startup.
CMD ["/app/main", "serve", "--http=0.0.0.0:8080"]