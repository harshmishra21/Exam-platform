output "eks_cluster_name" {
  value = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "s3_bucket_name" {
  value = aws_s3_bucket.assets.bucket
}

output "ecr_repository_url" {
  value = aws_ecr_repository.exam_backend.repository_url
}

output "vpc_id" {
  value = aws_vpc.main.id
}
