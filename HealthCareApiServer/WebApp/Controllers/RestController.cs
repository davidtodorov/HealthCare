using AutoMapper;
using HealthCare.Core.Base;
using HealthCare.Infrastructure;
using HealthCare.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebApp.Controllers
{
    public abstract class RestController<TEntity, TModel, TModelUpdate> : ApiController
        where TEntity : IEntity
        where TModel : class
        where TModelUpdate : class
    {
        public RestController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            this.unitOfWork = unitOfWork;
            repository = GetRepository(typeof(TEntity));
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IEnumerable<TModel>> Get()
        {
            var entities = await repository.GetAllAsync();
            var result = mapper.Map<IEnumerable<TEntity>, IEnumerable<TModel>>(entities);
            return result.ToList();
        }

        [HttpGet("{id}")]
        public virtual TModel Get(int id)
        {
            var entity = repository.GetById(id);
            var result = mapper.Map<TEntity, TModel>(entity);
            return result;
        }

        [HttpPost]
        public virtual ActionResult Post(TModel requestModel)
        {
            var result = mapper.Map<TModel, TEntity>(requestModel);
            repository.Insert(result);
            unitOfWork.SaveChanges();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public virtual ActionResult Put(int id, TModel requestModel)
        {
            var entity = repository.GetById(id);
            mapper.Map(requestModel, entity);
            unitOfWork.SaveChanges();
            return Ok(entity);
        }

        [HttpDelete("{id}")]
        public virtual ActionResult Delete(int id)
        {
            repository.Remove(id);
            unitOfWork.SaveChanges();
            return Ok();
        }

        #region private members
        private IRepository<TEntity> GetRepository(Type entityType)
        {
            foreach (var property in unitOfWork.GetType().GetProperties())
            {
                if (property.PropertyType.GenericTypeArguments.FirstOrDefault().Name == entityType.Name)
                {
                    return (IRepository<TEntity>)property.GetValue(unitOfWork);
                }
            }
            return null;
        }

        private readonly IRepository<TEntity> repository;
        private readonly IMapper mapper;
        protected readonly IUnitOfWork unitOfWork;
        #endregion
    }
}
