# ============================================================
# DYNAMODB — Shopping Cart State
# ============================================================
resource "aws_dynamodb_table" "cart" {
  name         = var.dynamodb_cart_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "sessionId"

  attribute {
    name = "sessionId"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = var.dynamodb_cart_table_name
  }
}

# ============================================================
# DYNAMODB — Application Event Logs
# ============================================================
resource "aws_dynamodb_table" "logs" {
  name         = var.dynamodb_logs_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "logId"
  range_key    = "timestamp"

  attribute {
    name = "logId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = var.dynamodb_logs_table_name
  }
}
